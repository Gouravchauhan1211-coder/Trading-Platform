-- Trading Platform Database Schema
-- PostgreSQL 15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Kong database (run separately as postgres user)
-- This is handled by Kong migrations bootstrap command

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    broker_name VARCHAR(50),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Strategies Table
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    trading_mode VARCHAR(20) DEFAULT 'MANUAL',
    status VARCHAR(20) DEFAULT 'STOPPED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Strategy Runs Table
CREATE TABLE IF NOT EXISTS strategy_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'RUNNING',
    profit_loss DECIMAL(15, 2) DEFAULT 0,
    error_message TEXT
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES strategies(id),
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    side VARCHAR(10) NOT NULL,
    order_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL,
    price DECIMAL(15, 4),
    stop_price DECIMAL(15, 4),
    status VARCHAR(20) DEFAULT 'PENDING',
    trading_mode VARCHAR(20) DEFAULT 'MANUAL',
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    external_order_id VARCHAR(100),
    error_message TEXT
);

-- Trades Table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    side VARCHAR(10) NOT NULL,
    execution_price DECIMAL(15, 4) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL,
    commission DECIMAL(15, 4) DEFAULT 0,
    total_amount DECIMAL(15, 4) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    external_trade_id VARCHAR(100)
);

-- Positions Table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
    avg_price DECIMAL(15, 4) DEFAULT 0,
    market_value DECIMAL(15, 4) DEFAULT 0,
    unrealized_pnl DECIMAL(15, 4) DEFAULT 0,
    realized_pnl DECIMAL(15, 4) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol, exchange)
);

-- Market Data Cache Table
CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(20) NOT NULL,
    last_price DECIMAL(15, 4),
    open_price DECIMAL(15, 4),
    high_price DECIMAL(15, 4),
    low_price DECIMAL(15, 4),
    close_price DECIMAL(15, 4),
    volume BIGINT DEFAULT 0,
    bid_price DECIMAL(15, 4),
    ask_price DECIMAL(15, 4),
    bid_quantity DECIMAL(15, 4),
    ask_quantity DECIMAL(15, 4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, exchange)
);

-- Risk Limits Table
CREATE TABLE IF NOT EXISTS risk_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_position_size DECIMAL(15, 4),
    max_daily_loss DECIMAL(15, 4),
    max_open_orders INTEGER DEFAULT 10,
    max_leverage DECIMAL(5, 2) DEFAULT 1.0,
    enable_position_limits BOOLEAN DEFAULT true,
    enable_daily_loss_limit BOOLEAN DEFAULT true,
    emergency_stop BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade Signals Table
CREATE TABLE IF NOT EXISTS trade_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID NOT NULL REFERENCES strategies(id),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) NOT NULL,
    price DECIMAL(15, 4),
    confidence DECIMAL(5, 2),
    parameters JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_symbol ON orders(symbol);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_executed_at ON trades(executed_at);
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_symbol ON positions(symbol);
CREATE INDEX idx_market_data_symbol ON market_data(symbol);
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_strategies_status ON strategies(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_trade_signals_strategy_id ON trade_signals(strategy_id);
CREATE INDEX idx_trade_signals_created_at ON trade_signals(created_at);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, first_name, last_name) 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@trading.com', '$2a$10$zdDl2EQAVXFzTLGr./Euq.lGf/4uVMUccRB8p5lYclyYUzJE.GMIu', 'Admin', 'User')
ON CONFLICT (email) DO NOTHING;

-- Insert default risk limits for admin
INSERT INTO risk_limits (id, user_id, max_position_size, max_daily_loss, max_open_orders, max_leverage)
SELECT 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', id, 100000, 10000, 20, 1.0
FROM users WHERE email = 'admin@trading.com'
ON CONFLICT DO NOTHING;
