CREATE DATABASE IF NOT EXISTS batloung_farm;
USE batloung_farm;

CREATE TABLE IF NOT EXISTS suppliers (
 supplier_id INT AUTO_INCREMENT PRIMARY KEY,
 business_name VARCHAR(120) NOT NULL,
 contact_person VARCHAR(100) NOT NULL,
 phone VARCHAR(30) NOT NULL UNIQUE,
 province ENUM('Gauteng','Free State','KwaZulu-Natal','Western Cape','Eastern Cape','Limpopo','Mpumalanga','North West') NOT NULL,
 address VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS fruits (
 fruit_id INT AUTO_INCREMENT PRIMARY KEY,
 fruit_name ENUM('Apples','Bananas','Oranges','Mangoes','Grapes') NOT NULL UNIQUE,
 description VARCHAR(255),
 status ENUM('AVAILABLE','INACTIVE') NOT NULL DEFAULT 'AVAILABLE'
);
CREATE TABLE IF NOT EXISTS vendors (
 vendor_id INT AUTO_INCREMENT PRIMARY KEY,
 vendor_name VARCHAR(120) NOT NULL,
 phone_number VARCHAR(30) NOT NULL UNIQUE,
 location VARCHAR(150) NOT NULL,
 registration_date DATE NOT NULL DEFAULT (CURRENT_DATE)
);
CREATE TABLE IF NOT EXISTS purchases (
 purchase_id INT AUTO_INCREMENT PRIMARY KEY,
 supplier_id INT NOT NULL,
 purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK(total_amount>=0),
 CONSTRAINT fk_purchase_supplier FOREIGN KEY(supplier_id) REFERENCES suppliers(supplier_id)
);
CREATE TABLE IF NOT EXISTS purchase_details (
 purchase_detail_id INT AUTO_INCREMENT PRIMARY KEY,
 purchase_id INT NOT NULL,
 fruit_id INT NOT NULL,
 quantity INT NOT NULL CHECK(quantity>0),
 unit_cost DECIMAL(10,2) NOT NULL CHECK(unit_cost>=0),
 packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
 FOREIGN KEY(purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
 FOREIGN KEY(fruit_id) REFERENCES fruits(fruit_id)
);
CREATE TABLE IF NOT EXISTS sales (
 sale_id INT AUTO_INCREMENT PRIMARY KEY,
 vendor_id INT NOT NULL,
 sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 payment_status ENUM('PAID','PARTIALLY_PAID','UNPAID') NOT NULL DEFAULT 'UNPAID',
 total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK(total_amount>=0),
 payment_method ENUM('CASH','MOBILE_MONEY','CREDIT') NOT NULL DEFAULT 'CASH',
 amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK(amount_paid>=0),
 FOREIGN KEY(vendor_id) REFERENCES vendors(vendor_id)
);
CREATE TABLE IF NOT EXISTS sales_details (
 sales_detail_id INT AUTO_INCREMENT PRIMARY KEY,
 sale_id INT NOT NULL,
 fruit_id INT NOT NULL,
 packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
 quantity INT NOT NULL CHECK(quantity>0),
 unit_price DECIMAL(10,2) NOT NULL CHECK(unit_price>=0),
 FOREIGN KEY(sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
 FOREIGN KEY(fruit_id) REFERENCES fruits(fruit_id)
);
CREATE TABLE IF NOT EXISTS stock (
 stock_id INT AUTO_INCREMENT PRIMARY KEY,
 fruit_id INT NOT NULL,
 packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
 available_quantity INT NOT NULL DEFAULT 0 CHECK(available_quantity>=0),
 UNIQUE KEY uq_fruit_packaging(fruit_id,packaging_size),
 FOREIGN KEY(fruit_id) REFERENCES fruits(fruit_id)
);
CREATE TABLE IF NOT EXISTS selling_prices (
 price_id INT AUTO_INCREMENT PRIMARY KEY,
 fruit_id INT NOT NULL,
 packaging_size ENUM('SMALL','MEDIUM','LARGE') NOT NULL,
 unit_price DECIMAL(10,2) NOT NULL CHECK(unit_price>=0),
 UNIQUE KEY uq_price_fruit_size(fruit_id,packaging_size),
 FOREIGN KEY(fruit_id) REFERENCES fruits(fruit_id)
);
CREATE TABLE IF NOT EXISTS payments (
 payment_id INT AUTO_INCREMENT PRIMARY KEY,
 sale_id INT NOT NULL,
 payment_method ENUM('CASH','MOBILE_MONEY','CREDIT') NOT NULL,
 amount DECIMAL(12,2) NOT NULL CHECK(amount>0),
 payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE
);

INSERT IGNORE INTO suppliers(business_name,contact_person,phone,province,address) VALUES
('Highveld Produce','Thabo Mokoena','+27110000001','Gauteng','Johannesburg, South Africa'),
('Free State Fresh','Lerato Dlamini','+27510000002','Free State','Bloemfontein, South Africa'),
('Cape Fruit Co.','Nandi Jacobs','+27210000003','Western Cape','Cape Town, South Africa');

INSERT IGNORE INTO fruits(fruit_name,description,status) VALUES
('Apples','Fresh red and green apples','AVAILABLE'),
('Bananas','Fresh bananas','AVAILABLE'),
('Oranges','Juicy oranges','AVAILABLE'),
('Mangoes','Seasonal mangoes','AVAILABLE'),
('Grapes','Seedless table grapes','AVAILABLE');

INSERT IGNORE INTO vendors(vendor_name,phone_number,location) VALUES
('Maseru Street Traders','+26658000001','Maseru'),
('Thamae Fresh Market','+26658000002','Ha Thamae'),
('Pioneer Road Vendors','+26658000003','Maseru');

INSERT IGNORE INTO stock(fruit_id,packaging_size,available_quantity)
SELECT f.fruit_id,p.packaging_size,0 FROM fruits f
CROSS JOIN (SELECT 'SMALL' packaging_size UNION SELECT 'MEDIUM' UNION SELECT 'LARGE') p;

INSERT IGNORE INTO selling_prices(fruit_id,packaging_size,unit_price)
SELECT f.fruit_id,p.packaging_size,
 CASE p.packaging_size WHEN 'SMALL' THEN 85.00 WHEN 'MEDIUM' THEN 150.00 ELSE 260.00 END
FROM fruits f
CROSS JOIN (SELECT 'SMALL' packaging_size UNION SELECT 'MEDIUM' UNION SELECT 'LARGE') p;

-- Sample opening stock: quantities are boxes for each packaging size.
UPDATE stock SET available_quantity=25 WHERE packaging_size='SMALL';
UPDATE stock SET available_quantity=18 WHERE packaging_size='MEDIUM';
UPDATE stock SET available_quantity=12 WHERE packaging_size='LARGE';
