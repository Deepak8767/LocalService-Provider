-- Insert admin user if not exists
INSERT INTO users (name, email, password, role, status, status1, service_type, pincode, address, state, district, phone_no)
SELECT 
    'Deepak Deore',                  -- name
    'admin@gmail.com',               -- email
    '$2a$10$NVD4gRnS.UyDsXiLXeKJZ.v7uiiY5S1/SqKzp89hN1FyskV0AMKXS',  -- password (encoded value of 'admin')
    'ADMIN',                         -- role
    'active',                        -- status
    'active',                        -- status1
    NULL,                           -- service_type (NULL for admin)
    NULL,                           -- pincode
    NULL,                           -- address
    NULL,                           -- state
    NULL,                           -- district
    NULL                            -- phone_no
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@gmail.com'
);