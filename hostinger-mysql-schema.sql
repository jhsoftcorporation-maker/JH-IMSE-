-- ============================================================================
-- JH IMSE - Enterprise Multi-Tenant ERP, Cloud POS & Multi-Company Platform
-- JH Soft Corporation | Production MySQL Database Schema for Hostinger
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Compatible with: Hostinger Business Web Hosting MySQL 8.0+ / phpMyAdmin
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00"; -- Bangladesh Standard Time (BST)

-- ----------------------------------------------------------------------------
-- 1. TENANTS & MULTI-COMPANY SUBSCRIPTION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `business_type` ENUM('grocery', 'pharmacy', 'electronics', 'warehouse') NOT NULL DEFAULT 'grocery',
  `owner_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT '৳',
  `plan` ENUM('trial', 'starter', 'professional', 'enterprise') NOT NULL DEFAULT 'starter',
  `status` ENUM('active', 'suspended', 'grace_period', 'expired') NOT NULL DEFAULT 'active',
  `subscription_expiry` DATE NOT NULL,
  `monthly_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `billing_cycle` ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  `license_key` VARCHAR(100) DEFAULT NULL,
  `trade_license_no` VARCHAR(100) DEFAULT NULL,
  `tax_vat_no` VARCHAR(100) DEFAULT NULL,
  `custom_domain` VARCHAR(255) DEFAULT NULL,
  `custom_domain_status` ENUM('none', 'pending', 'active', 'rejected') NOT NULL DEFAULT 'none',
  `max_branches` INT NOT NULL DEFAULT 1,
  `max_users` INT NOT NULL DEFAULT 3,
  `max_products` INT NOT NULL DEFAULT 1000,
  `max_monthly_invoices` INT NOT NULL DEFAULT 500,
  `storage_gb` INT NOT NULL DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tenant_slug` (`slug`),
  INDEX `idx_tenant_domain` (`custom_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. USERS, CUSTOM AUTHENTICATION & RBAC
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL, -- bcrypt/argon2 hash
  `role` ENUM('super_admin', 'owner', 'manager', 'cashier', 'accountant', 'auditor') NOT NULL DEFAULT 'cashier',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_user_email` (`tenant_id`, `email`),
  UNIQUE KEY `uk_tenant_user_phone` (`tenant_id`, `phone`),
  CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. OTP VERIFICATIONS (LOGIN & FORGOT PASSWORD)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `identifier` VARCHAR(150) NOT NULL, -- phone number or email address
  `otp_code` VARCHAR(10) NOT NULL,
  `purpose` ENUM('login', 'forgot_password', 'phone_verify', 'transaction_auth') NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_otp_identifier` (`identifier`, `otp_code`),
  INDEX `idx_otp_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. GATEWAY SETTINGS (SMS, EMAIL SMTP & PAYMENT KEYS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gateway_settings` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  -- SMS Gateway (Greenweb, MiMSMS, Onnorokom, Infobip)
  `sms_provider` VARCHAR(50) DEFAULT 'greenweb',
  `sms_api_key` VARCHAR(255) DEFAULT NULL,
  `sms_sender_id` VARCHAR(50) DEFAULT NULL, -- Masking name (e.g. JHSOFT)
  `sms_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  -- Email SMTP Gateway (Hostinger Webmail / Resend / SendGrid)
  `smtp_host` VARCHAR(150) DEFAULT 'smtp.hostinger.com',
  `smtp_port` INT DEFAULT 465,
  `smtp_secure` ENUM('ssl', 'tls') DEFAULT 'ssl',
  `smtp_user` VARCHAR(150) DEFAULT NULL,
  `smtp_pass` VARCHAR(255) DEFAULT NULL,
  `smtp_from_name` VARCHAR(100) DEFAULT 'JH IMSE Cloud Billing',
  `smtp_from_email` VARCHAR(150) DEFAULT NULL,
  -- Payment Gateways (bKash Merchant, Nagad, Shurjopay, SSLCommerz)
  `bkash_app_key` VARCHAR(255) DEFAULT NULL,
  `bkash_app_secret` VARCHAR(255) DEFAULT NULL,
  `bkash_username` VARCHAR(100) DEFAULT NULL,
  `bkash_password` VARCHAR(255) DEFAULT NULL,
  `bkash_merchant_number` VARCHAR(30) DEFAULT NULL,
  `nagad_merchant_id` VARCHAR(100) DEFAULT NULL,
  `nagad_public_key` TEXT DEFAULT NULL,
  `nagad_private_key` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gateway_tenant` (`tenant_id`),
  CONSTRAINT `fk_gateway_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. WAREHOUSES & PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `is_main` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_wh_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `cost_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `selling_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `wholesale_price` DECIMAL(12, 2) DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `alert_stock` INT NOT NULL DEFAULT 5,
  `unit` VARCHAR(30) NOT NULL DEFAULT 'pcs',
  `manufacturer` VARCHAR(150) DEFAULT NULL,
  `rack_number` VARCHAR(50) DEFAULT NULL,
  `is_online` TINYINT(1) NOT NULL DEFAULT 1,
  -- Pharmacy Fields
  `generic_name` VARCHAR(255) DEFAULT NULL,
  `dosage_form` VARCHAR(50) DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `batch_number` VARCHAR(100) DEFAULT NULL,
  `dar_number` VARCHAR(100) DEFAULT NULL,
  -- Electronics Fields
  `brand` VARCHAR(100) DEFAULT NULL,
  `model_number` VARCHAR(100) DEFAULT NULL,
  `warranty_months` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_sku` (`tenant_id`, `sku`),
  INDEX `idx_prod_category` (`tenant_id`, `category`),
  INDEX `idx_prod_barcode` (`tenant_id`, `barcode`),
  CONSTRAINT `fk_products_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. CUSTOMERS & DIGITAL DUE LEDGER (বাকি খাতা)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `customer_type` ENUM('retail', 'wholesale', 'corporate') NOT NULL DEFAULT 'retail',
  `loyalty_tier` ENUM('bronze', 'silver', 'gold', 'vip') NOT NULL DEFAULT 'bronze',
  `credit_limit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `due_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_spent` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `purchase_count` INT NOT NULL DEFAULT 0,
  `last_purchased` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customer_phone` (`tenant_id`, `phone`),
  CONSTRAINT `fk_customers_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_transactions` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `customer_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `type` ENUM('invoice', 'payment', 'return') NOT NULL,
  `reference_no` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `debit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `credit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash', 'bkash', 'nagad', 'bank', 'due') DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cust_trx` (`customer_id`, `date`),
  CONSTRAINT `fk_cust_trx_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. SALES INVOICES & MONEY RECEIPTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `invoice_number` VARCHAR(100) NOT NULL,
  `warehouse_id` VARCHAR(64) NOT NULL,
  `customer_id` VARCHAR(64) DEFAULT NULL,
  `customer_name` VARCHAR(150) DEFAULT NULL,
  `customer_phone` VARCHAR(30) DEFAULT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `paid_amount` DECIMAL(12, 2) NOT NULL,
  `due_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `change_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash', 'bkash', 'nagad', 'card', 'due') NOT NULL,
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `cashier_id` VARCHAR(64) DEFAULT NULL,
  `cashier_name` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('completed', 'draft', 'cancelled') NOT NULL DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_invoice` (`tenant_id`, `invoice_number`),
  INDEX `idx_sales_date` (`tenant_id`, `created_at`),
  CONSTRAINT `fk_sales_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `sale_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `cost_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `batch_number` VARCHAR(100) DEFAULT NULL,
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. PHASE 6: OPERATIONAL EXPENSES (খরচের হিসাব খাতা)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `voucher_no` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `category` ENUM(
    'rent', 'utilities', 'salaries', 'food_entertainment',
    'transport_courier', 'marketing', 'maintenance',
    'packaging', 'tax_trade_license', 'other'
  ) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `payment_method` ENUM('cash', 'bkash', 'nagad', 'bank') NOT NULL DEFAULT 'cash',
  `reference_no` VARCHAR(100) DEFAULT NULL,
  `paid_to` VARCHAR(150) DEFAULT NULL,
  `approved_by` VARCHAR(150) NOT NULL,
  `receipt_image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_expense_voucher` (`tenant_id`, `voucher_no`),
  INDEX `idx_expense_date` (`tenant_id`, `date`),
  CONSTRAINT `fk_expenses_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. PHASE 6: SUPPLIERS & ACCOUNTS PAYABLE (মহাজন লেজার)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` TEXT NOT NULL,
  `category` VARCHAR(150) NOT NULL,
  `trade_license_no` VARCHAR(100) DEFAULT NULL,
  `bank_account_details` TEXT DEFAULT NULL,
  `total_purchases` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_paid` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `due_balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, -- We owe them
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_suppliers_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_transactions` (
  `id` VARCHAR(64) NOT NULL,
  `supplier_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `type` ENUM('purchase_bill', 'payment', 'purchase_return') NOT NULL,
  `reference_no` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `debit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `credit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash', 'bkash', 'nagad', 'bank') DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_sup_trx` (`supplier_id`, `date`),
  CONSTRAINT `fk_sup_trx_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_purchase_orders` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `po_number` VARCHAR(100) NOT NULL,
  `supplier_id` VARCHAR(64) NOT NULL,
  `supplier_name` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `paid_amount` DECIMAL(12, 2) NOT NULL,
  `due_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash', 'bkash', 'nagad', 'bank', 'due') NOT NULL,
  `status` ENUM('received', 'ordered', 'cancelled') NOT NULL DEFAULT 'received',
  `note` TEXT DEFAULT NULL,
  `received_by` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_po` (`tenant_id`, `po_number`),
  CONSTRAINT `fk_po_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_payments` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `payment_voucher_no` VARCHAR(100) NOT NULL,
  `supplier_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `payment_method` ENUM('cash', 'bkash', 'nagad', 'bank') NOT NULL,
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `remaining_due` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `note` TEXT DEFAULT NULL,
  `paid_by` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_payment_voucher` (`tenant_id`, `payment_voucher_no`),
  CONSTRAINT `fk_sp_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. PHASE 5: HRM EMPLOYEES, ATTENDANCE & SALARY SLIPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `designation` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `nid_number` VARCHAR(50) DEFAULT NULL,
  `basic_salary` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `sales_commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `monthly_sales_target` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `assigned_warehouse_id` VARCHAR(64) DEFAULT NULL,
  `joining_date` DATE NOT NULL,
  `status` ENUM('active', 'on_leave', 'terminated') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_emp_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `employee_id` VARCHAR(64) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('present', 'absent', 'late', 'half_day', 'on_leave') NOT NULL,
  `clock_in` VARCHAR(20) DEFAULT NULL,
  `clock_out` VARCHAR(20) DEFAULT NULL,
  `overtime_hours` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_date` (`tenant_id`, `employee_id`, `date`),
  CONSTRAINT `fk_att_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `salary_slips` (
  `id` VARCHAR(64) NOT NULL,
  `slip_number` VARCHAR(100) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `employee_id` VARCHAR(64) NOT NULL,
  `month` VARCHAR(50) NOT NULL,
  `basic_salary` DECIMAL(12, 2) NOT NULL,
  `sales_commission` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `overtime_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `gross_earnings` DECIMAL(12, 2) NOT NULL,
  `total_deductions` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `net_payable` DECIMAL(12, 2) NOT NULL,
  `payment_method` ENUM('cash', 'bkash', 'bank') NOT NULL DEFAULT 'cash',
  `payment_date` DATE NOT NULL,
  `status` ENUM('paid', 'pending') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_salary_slip_no` (`tenant_id`, `slip_number`),
  CONSTRAINT `fk_salary_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. PHASE 7 & 8: ONLINE E-COMMERCE ORDERS & LINE ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `online_orders` (
  `id` VARCHAR(64) NOT NULL,
  `order_number` VARCHAR(100) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `customer_email` VARCHAR(150) DEFAULT NULL,
  `customer_address` TEXT NOT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `delivery_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `delivery_area` ENUM('inside_dhaka', 'outside_dhaka', 'store_pickup', 'pickup') NOT NULL DEFAULT 'inside_dhaka',
  `payment_method` ENUM('cod', 'bkash', 'nagad', 'rocket', 'bank') NOT NULL DEFAULT 'cod',
  `payment_status` ENUM('paid', 'unpaid', 'cod') NOT NULL DEFAULT 'cod',
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `sender_phone` VARCHAR(30) DEFAULT NULL,
  `courier_partner` ENUM('steadfast', 'redx', 'pathao', 'in_house') DEFAULT 'steadfast',
  `courier_tracking_id` VARCHAR(100) DEFAULT NULL,
  `courier_status` ENUM('pending_pickup', 'in_transit', 'delivered', 'returned') DEFAULT 'pending_pickup',
  `customer_notes` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'accepted', 'confirmed', 'packing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_number` (`tenant_id`, `order_number`),
  CONSTRAINT `fk_online_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `online_order_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) DEFAULT NULL,
  `unit` VARCHAR(30) DEFAULT 'pcs',
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `online_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. SAAS SUBSCRIPTION PAYMENT REQUESTS (MANUAL VERIFICATION)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscription_payment_requests` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `tenant_name` VARCHAR(255) NOT NULL,
  `owner_name` VARCHAR(150) NOT NULL,
  `owner_phone` VARCHAR(30) NOT NULL,
  `plan` ENUM('trial', 'starter', 'professional', 'enterprise') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `billing_cycle` ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  `payment_method` ENUM('bKash', 'Nagad', 'Rocket', 'Bank Transfer') NOT NULL,
  `sender_phone` VARCHAR(30) NOT NULL,
  `trx_id` VARCHAR(100) NOT NULL,
  `screenshot_url` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT DEFAULT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sub_req_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. CUSTOM DOMAIN & CNAME DNS REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `custom_domain_requests` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `tenant_name` VARCHAR(255) NOT NULL,
  `domain` VARCHAR(255) NOT NULL UNIQUE,
  `target_cname` VARCHAR(255) NOT NULL DEFAULT 'cname.jh-imse.shop',
  `status` ENUM('pending', 'active', 'rejected', 'failed') NOT NULL DEFAULT 'pending',
  `ssl_status` ENUM('pending', 'secured', 'failed') NOT NULL DEFAULT 'pending',
  `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `verified_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_domain_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. GLOBAL BROADCAST NOTICES & SYSTEM ANNOUNCEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `broadcast_notices` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'warning', 'maintenance', 'critical') NOT NULL DEFAULT 'info',
  `target` ENUM('all', 'starter', 'professional', 'enterprise') NOT NULL DEFAULT 'all',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. WHOLE WEBSITE CMS & GLOBAL PLATFORM SETTINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `global_platform_settings` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `platform_name` VARCHAR(150) NOT NULL DEFAULT 'JH IMSE Cloud SaaS',
  `platform_title_bn` TEXT DEFAULT NULL,
  `platform_subtitle_bn` TEXT DEFAULT NULL,
  `helpline_phone` VARCHAR(30) NOT NULL DEFAULT '+8801940999830',
  `support_email` VARCHAR(150) NOT NULL DEFAULT 'support@jh-imse.shop',
  `office_address` TEXT DEFAULT NULL,
  `maintenance_mode` TINYINT(1) NOT NULL DEFAULT 0,
  `global_announcement` TEXT DEFAULT NULL,
  `fleet_pos_lockdown` TINYINT(1) NOT NULL DEFAULT 0,
  `allow_registration` TINYINT(1) NOT NULL DEFAULT 1,
  `default_trial_days` INT NOT NULL DEFAULT 14,
  `default_currency` VARCHAR(10) NOT NULL DEFAULT '৳',
  `hostinger_cname_target` VARCHAR(150) NOT NULL DEFAULT 'cname.jh-imse.shop',
  `offline_pwa_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. PHASE 11: MULTI-BRANCH LOGISTICS & STORE REQUISITION ORDERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `branch_requisitions` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `requisition_no` VARCHAR(50) NOT NULL,
  `from_branch_id` VARCHAR(64) NOT NULL,
  `to_warehouse_id` VARCHAR(64) NOT NULL,
  `requested_by` VARCHAR(150) NOT NULL,
  `status` ENUM('draft', 'submitted', 'approved', 'in_transit', 'completed', 'rejected') NOT NULL DEFAULT 'submitted',
  `urgency` ENUM('normal', 'urgent', 'critical') NOT NULL DEFAULT 'normal',
  `total_estimated_value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME DEFAULT NULL,
  `approved_by` VARCHAR(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_req_no` (`tenant_id`, `requisition_no`),
  CONSTRAINT `fk_req_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `branch_requisition_items` (
  `id` VARCHAR(64) NOT NULL,
  `requisition_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `requested_qty` DECIMAL(10, 2) NOT NULL,
  `approved_qty` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `unit_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_req_item_parent` FOREIGN KEY (`requisition_id`) REFERENCES `branch_requisitions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. PHASE 11: INTER-BRANCH STOCK TRANSFER CHALLANS & GOODS IN TRANSIT (GIT)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_transfer_challans` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `transfer_no` VARCHAR(50) NOT NULL,
  `gatepass_barcode` VARCHAR(100) DEFAULT NULL,
  `requisition_id` VARCHAR(64) DEFAULT NULL,
  `source_warehouse_id` VARCHAR(64) NOT NULL,
  `destination_branch_id` VARCHAR(64) NOT NULL,
  `driver_name` VARCHAR(100) NOT NULL,
  `driver_phone` VARCHAR(30) NOT NULL,
  `vehicle_no` VARCHAR(100) NOT NULL,
  `total_items` INT NOT NULL DEFAULT 0,
  `total_cost_value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('dispatched', 'in_transit', 'received', 'discrepancy') NOT NULL DEFAULT 'in_transit',
  `grn_no` VARCHAR(50) DEFAULT NULL,
  `dispatched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `dispatched_by` VARCHAR(150) NOT NULL,
  `received_at` DATETIME DEFAULT NULL,
  `received_by` VARCHAR(150) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transfer_no` (`tenant_id`, `transfer_no`),
  CONSTRAINT `fk_transfer_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_transfer_items` (
  `id` VARCHAR(64) NOT NULL,
  `transfer_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `unit_cost` DECIMAL(10, 2) NOT NULL,
  `dispatched_qty` DECIMAL(10, 2) NOT NULL,
  `received_qty` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `damaged_qty` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `damage_reason` VARCHAR(255) DEFAULT NULL,
  `batch_number` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_transfer_item_parent` FOREIGN KEY (`transfer_id`) REFERENCES `stock_transfer_challans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 18. PHASE 12: AI AUTONOMOUS DEMAND FORECASTING & AUTO-PURCHASE ORDERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_demand_forecasts` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `sales_velocity` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `days_inventory_remaining` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `run_out_date` DATE DEFAULT NULL,
  `lead_time_days` INT NOT NULL DEFAULT 2,
  `safety_stock` INT NOT NULL DEFAULT 0,
  `reorder_point` INT NOT NULL DEFAULT 0,
  `recommended_order_qty` INT NOT NULL DEFAULT 0,
  `risk_level` ENUM('critical', 'warning', 'optimal', 'overstocked', 'dead_stock') NOT NULL DEFAULT 'optimal',
  `preferred_supplier_id` VARCHAR(64) DEFAULT NULL,
  `revenue_at_risk` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `ai_reasoning` TEXT DEFAULT NULL,
  `calculated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_forecast_tenant_risk` (`tenant_id`, `risk_level`),
  CONSTRAINT `fk_forecast_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_auto_purchase_orders` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `auto_po_number` VARCHAR(50) NOT NULL,
  `supplier_id` VARCHAR(64) NOT NULL,
  `supplier_name` VARCHAR(150) NOT NULL,
  `supplier_phone` VARCHAR(30) DEFAULT NULL,
  `supplier_email` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('draft', 'approved', 'sent_whatsapp', 'sent_email', 'received', 'cancelled') NOT NULL DEFAULT 'draft',
  `urgency` ENUM('critical', 'high', 'normal') NOT NULL DEFAULT 'normal',
  `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `delivery_expected_date` DATE DEFAULT NULL,
  `ai_generated_reason` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_auto_po` (`tenant_id`, `auto_po_number`),
  CONSTRAINT `fk_autopo_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_auto_po_items` (
  `id` VARCHAR(64) NOT NULL,
  `auto_po_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL,
  `current_stock` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `velocity_daily` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `days_remaining` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `recommended_qty` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `order_qty` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `unit_cost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `total_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_autopo_item_parent` FOREIGN KEY (`auto_po_id`) REFERENCES `ai_auto_purchase_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 19. PHASE 13: GLOBAL PAYMENTS, MULTI-CURRENCY FOREX & CROSS-BORDER TAXES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `currency_exchange_rates` (
  `id` VARCHAR(64) NOT NULL,
  `from_currency` VARCHAR(10) NOT NULL,
  `to_currency` VARCHAR(10) NOT NULL DEFAULT 'BDT',
  `rate` DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
  `inverse_rate` DECIMAL(12, 6) NOT NULL DEFAULT 1.000000,
  `buy_rate` DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
  `sell_rate` DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
  `spread_pct` DECIMAL(6, 2) NOT NULL DEFAULT 1.00,
  `change_24h_pct` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  `source` ENUM('bangladesh_bank', 'open_exchange_rates', 'manual') NOT NULL DEFAULT 'bangladesh_bank',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_currency_pair` (`from_currency`, `to_currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_gateway_configs` (
  `id` VARCHAR(64) NOT NULL,
  `gateway_key` VARCHAR(30) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `name_bn` VARCHAR(150) NOT NULL,
  `is_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `mode` ENUM('sandbox', 'production') NOT NULL DEFAULT 'sandbox',
  `publishable_key` VARCHAR(255) NOT NULL,
  `secret_key_encrypted` VARCHAR(255) NOT NULL,
  `webhook_secret_encrypted` VARCHAR(255) DEFAULT NULL,
  `transaction_fee_pct` DECIMAL(5, 2) NOT NULL DEFAULT 2.90,
  `fixed_fee` DECIMAL(6, 2) NOT NULL DEFAULT 0.30,
  `sca_compliant` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gateway_key` (`gateway_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cross_border_tax_slabs` (
  `id` VARCHAR(64) NOT NULL,
  `country_code` VARCHAR(5) NOT NULL,
  `country_name` VARCHAR(100) NOT NULL,
  `tax_type` ENUM('vat', 'sales_tax', 'gst', 'mushak_6_3') NOT NULL DEFAULT 'vat',
  `standard_rate_pct` DECIMAL(6, 3) NOT NULL DEFAULT 15.000,
  `reduced_rate_pct` DECIMAL(6, 3) DEFAULT NULL,
  `export_rate_pct` DECIMAL(6, 3) NOT NULL DEFAULT 0.000,
  `tds_rate_pct` DECIMAL(6, 3) DEFAULT 0.000,
  `reverse_charge_applicable` TINYINT(1) NOT NULL DEFAULT 0,
  `tax_authority` VARCHAR(150) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tax_country` (`country_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cross_border_transactions` (
  `id` VARCHAR(64) NOT NULL,
  `tenant_id` VARCHAR(64) NOT NULL,
  `transaction_no` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_country` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `gateway` ENUM('stripe', 'paypal', 'apple_pay', 'bkash') NOT NULL,
  `currency` VARCHAR(10) NOT NULL,
  `foreign_amount` DECIMAL(12, 2) NOT NULL,
  `exchange_rate` DECIMAL(12, 4) NOT NULL,
  `base_amount_bdt` DECIMAL(14, 2) NOT NULL,
  `settlement_exchange_rate` DECIMAL(12, 4) NOT NULL,
  `settlement_amount_bdt` DECIMAL(14, 2) NOT NULL,
  `forex_gain_loss_bdt` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `gateway_fee_bdt` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `net_amount_bdt` DECIMAL(14, 2) NOT NULL,
  `status` ENUM('succeeded', 'pending', 'failed', 'refunded') NOT NULL DEFAULT 'succeeded',
  `payment_intent_id` VARCHAR(150) NOT NULL,
  `card_last4` VARCHAR(4) DEFAULT NULL,
  `card_brand` VARCHAR(20) DEFAULT NULL,
  `three_d_secure_authenticated` TINYINT(1) NOT NULL DEFAULT 1,
  `date` DATETIME NOT NULL,
  `journal_entry_posted` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_global_trx` (`transaction_no`),
  KEY `idx_glb_tenant` (`tenant_id`),
  CONSTRAINT `fk_glb_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

