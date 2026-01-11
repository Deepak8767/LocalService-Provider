package com.provider.service.controller;

import com.provider.service.entity.BookingEntity;
import com.provider.service.entity.ServiceEntity;
import com.provider.service.repository.ServiceRepository;
import com.provider.service.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final com.provider.service.repository.UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    public BookingController(BookingRepository bookingRepository, ServiceRepository serviceRepository, com.provider.service.repository.UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @Value("${razorpay.key_id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret:}")
    private String razorpayKeySecret;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody java.util.Map<String, Object> payload) {
        try{
            Long userId = payload.get("userId") == null ? null : Long.valueOf(payload.get("userId").toString());
            Long serviceId = payload.get("serviceId") == null ? null : Long.valueOf(payload.get("serviceId").toString());
            if(serviceId == null) return ResponseEntity.badRequest().body("serviceId is required");
            ServiceEntity service = serviceRepository.findById(serviceId).orElse(null);
            if(service == null) return ResponseEntity.badRequest().body("Invalid serviceId");

            BookingEntity booking = new BookingEntity();
            if (userId != null) {
                var u = userRepository.findById(userId).orElse(null);
                booking.setUser(u);
            }
            booking.setService(service);
            // set redundant providerId for easier queries
            if (service.getProvider() != null) booking.setProviderId(service.getProvider().getId());
            booking.setAddress((String) payload.getOrDefault("address", ""));
            booking.setProviderNote((String) payload.getOrDefault("providerNote", null));
            booking.setUserNote((String) payload.getOrDefault("userNote", null));
            booking.setStatus("BOOKED");
            if(payload.get("date") == null) booking.setDate(LocalDateTime.now());
            else booking.setDate(LocalDateTime.parse(payload.get("date").toString()));

            BookingEntity saved = bookingRepository.save(booking);
            return ResponseEntity.ok(saved);
        }catch(Exception e){
            logger.error("Failed to create booking", e);
            return ResponseEntity.status(500).body("Failed to create booking: " + e.getMessage());
        }
    }

    // Provider accepts booking and sets an amount. This creates a Razorpay order and sets booking to AWAITING_PAYMENT.
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        try {
            Double amount = null;
            try {
                Object amo = payload.get("amount");
                if (amo != null) {
                    amount = Double.valueOf(amo.toString());
                }
            } catch (NumberFormatException nfe) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount format"));
            }
            // validate amount: must be a finite positive number
            if (amount == null || !Double.isFinite(amount) || amount <= 0.0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount; must be a positive number"));
            }
            String providerNote = payload.get("providerNote") == null ? null : payload.get("providerNote").toString();
            if (amount == null) return ResponseEntity.badRequest().body(Map.of("error", "amount is required"));

            BookingEntity booking = bookingRepository.findById(id).orElse(null);
            if (booking == null) return ResponseEntity.notFound().build();

            booking.setProviderAmount(amount);
            if (providerNote != null) booking.setProviderNote(providerNote);
            booking.setStatus("AWAITING_PAYMENT");

            // create razorpay order if keys available
            if (razorpayKeyId != null && !razorpayKeyId.isBlank() && razorpayKeySecret != null && !razorpayKeySecret.isBlank()) {
                try {
                    JSONObject orderRequest = new JSONObject();
                    // amount in paise
                    int amtPaise = (int) Math.round(amount * 100);
                    if (amtPaise <= 0) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Amount too small after conversion; must be at least 0.01"));
                    }
                    orderRequest.put("amount", amtPaise);
                    orderRequest.put("currency", "INR");
                    orderRequest.put("receipt", "booking_" + id);
                    orderRequest.put("payment_capture", 1);

                    java.net.URL url = new java.net.URL("https://api.razorpay.com/v1/orders");
                    java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setDoOutput(true);
                    String auth = razorpayKeyId + ":" + razorpayKeySecret;
                    String encoded = java.util.Base64.getEncoder().encodeToString(auth.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                    conn.setRequestProperty("Authorization", "Basic " + encoded);
                    conn.setRequestProperty("Content-Type", "application/json");

                    try (java.io.OutputStream os = conn.getOutputStream()) {
                        byte[] input = orderRequest.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        os.write(input, 0, input.length);
                    }

                    int status = conn.getResponseCode();
                    java.io.InputStream is = status >= 200 && status < 300 ? conn.getInputStream() : conn.getErrorStream();
                    java.io.StringWriter sw = new java.io.StringWriter();
                    try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(is, java.nio.charset.StandardCharsets.UTF_8))) {
                        String line;
                        while ((line = br.readLine()) != null) {
                            sw.write(line);
                        }
                    }
                    String respText = sw.toString();
                    if (status < 200 || status >= 300) {
                        return ResponseEntity.status(502).body(Map.of("error", "Razorpay order creation failed", "details", respText));
                    }
                    JSONObject respJson = new JSONObject(respText);
                    String orderId = respJson.optString("id", null);
                    if (orderId == null) {
                        return ResponseEntity.status(502).body(Map.of("error", "Razorpay response missing order id", "response", respJson.toString()));
                    }
                    booking.setRazorpayOrderId(orderId);
                } catch (Exception re) {
                    logger.error("Failed to create payment order", re);
                    return ResponseEntity.status(502).body(Map.of("error", "Failed to create payment order: " + re.getMessage()));
                }
            }

            // read some fields before saving to avoid lazy-loading after session close
            Long svcId = null;
            String svcName = null;
            Long uId = null;
            String uName = null;
            try {
                if (booking.getService() != null) {
                    svcId = booking.getService().getId();
                    svcName = booking.getService().getServiceName();
                }
            } catch (Exception ignore) {}
            try {
                if (booking.getUser() != null) {
                    uId = booking.getUser().getId();
                    uName = booking.getUser().getName();
                }
            } catch (Exception ignore) {}

            BookingEntity saved = bookingRepository.save(booking);
            // construct a minimal DTO to avoid lazy-loading/serialization problems
            java.util.Map<String, Object> binfo = new java.util.HashMap<>();
            binfo.put("id", saved.getId());
            binfo.put("status", saved.getStatus());
            binfo.put("providerAmount", saved.getProviderAmount());
            binfo.put("razorpayOrderId", saved.getRazorpayOrderId());
            binfo.put("razorpayPaymentId", saved.getRazorpayPaymentId());
            binfo.put("providerId", saved.getProviderId());
            if (svcId != null) binfo.put("serviceId", svcId);
            if (svcName != null) binfo.put("serviceName", svcName);
            if (uId != null) binfo.put("userId", uId);
            if (uName != null) binfo.put("userName", uName);
            return ResponseEntity.ok(Map.of("booking", binfo, "keyId", razorpayKeyId));
        } catch (Exception e) {
            logger.error("Failed to accept booking", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to accept booking: " + e.getMessage()));
        }
    }

    // Verify payment signature sent from client after successful payment
    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verifyPayment(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        try {
            String razorpayPaymentId = payload.get("razorpay_payment_id") == null ? null : payload.get("razorpay_payment_id").toString();
            String razorpayOrderId = payload.get("razorpay_order_id") == null ? null : payload.get("razorpay_order_id").toString();
            String razorpaySignature = payload.get("razorpay_signature") == null ? null : payload.get("razorpay_signature").toString();

            if (razorpayPaymentId == null || razorpayOrderId == null || razorpaySignature == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing payment verification parameters"));
            }

            // compute expected signature: HMAC_SHA256(orderId + "|" + paymentId, secret)
            String data = razorpayOrderId + "|" + razorpayPaymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes());
            // convert to hex lowercase
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b & 0xff));
            String expected = sb.toString();

            if (!expected.equals(razorpaySignature)) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid signature"));
            }

            // mark booking as paid
            BookingEntity booking = bookingRepository.findById(id).orElse(null);
            if (booking == null) return ResponseEntity.notFound().build();
            booking.setRazorpayPaymentId(razorpayPaymentId);
            booking.setStatus("PAID");
            BookingEntity saved = bookingRepository.save(booking);
            return ResponseEntity.ok(Map.of("booking", saved));
        } catch (Exception e) {
            logger.error("Failed to verify payment", e);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to verify payment: " + e.getMessage()));
        }
    }

    // expose order info for a booking to the client (order id, amount, currency, keyId)
    @GetMapping("/{id}/order")
    public ResponseEntity<?> getOrderInfo(@PathVariable Long id) {
        return bookingRepository.findById(id).map(b -> {
            return ResponseEntity.ok(Map.of(
                "orderId", b.getRazorpayOrderId(),
                "amount", b.getProviderAmount(),
                "currency", "INR",
                "keyId", razorpayKeyId
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<BookingEntity> listBookings(@RequestParam(required = false) Long userId,
                                           @RequestParam(required = false) Long providerId) {
        try {
            if (userId != null) return bookingRepository.findByUserId(userId);
            if (providerId != null) {
                // prefer the direct providerId column lookup if available
                try {
                    return bookingRepository.findByProviderId(providerId);
                } catch (Exception e) {
                    // fallback to joining via service.provider
                    return bookingRepository.findByService_Provider_Id(providerId);
                }
            }
            return bookingRepository.findAll();
        } catch (Exception e) {
            logger.error("Failed to list bookings", e);
            throw new RuntimeException("Failed to list bookings: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        // support optional providerNote when updating status
        return bookingRepository.findById(id).map(b -> {
            b.setStatus(status);
            return ResponseEntity.ok(bookingRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Patch booking: accept JSON body with optional fields { status, providerNote }
    @PatchMapping("/{id}")
    public ResponseEntity<?> patchBooking(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        return bookingRepository.findById(id).map(b -> {
            if (payload.containsKey("status") && payload.get("status") != null) {
                b.setStatus(payload.get("status").toString());
            }
            if (payload.containsKey("providerNote")) {
                Object note = payload.get("providerNote");
                b.setProviderNote(note == null ? null : note.toString());
            }
            if (payload.containsKey("userNote")) {
                Object un = payload.get("userNote");
                b.setUserNote(un == null ? null : un.toString());
            }
            BookingEntity saved = bookingRepository.save(b);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Fallback POST endpoint for environments where PATCH may not be available from client
    @PostMapping("/{id}/note")
    public ResponseEntity<?> postProviderNote(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        return bookingRepository.findById(id).map(b -> {
            if (payload.containsKey("providerNote")) {
                Object note = payload.get("providerNote");
                b.setProviderNote(note == null ? null : note.toString());
            }
            if (payload.containsKey("userNote")) {
                Object un = payload.get("userNote");
                b.setUserNote(un == null ? null : un.toString());
            }
            if (payload.containsKey("status") && payload.get("status") != null) {
                b.setStatus(payload.get("status").toString());
            }
            BookingEntity saved = bookingRepository.save(b);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Alternate POST endpoint accepting providerNote and status as request parameters (form/url-encoded)
    @PostMapping("/{id}/note-form")
    public ResponseEntity<?> postProviderNoteForm(@PathVariable Long id,
                                                  @RequestParam(required = false) String providerNote,
                                                  @RequestParam(required = false) String status,
                                                  @RequestParam(required = false) String userNote) {
        return bookingRepository.findById(id).map(b -> {
            if (providerNote != null) b.setProviderNote(providerNote);
            if (userNote != null) b.setUserNote(userNote);
            if (status != null) b.setStatus(status);
            BookingEntity saved = bookingRepository.save(b);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
