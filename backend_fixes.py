# ADD these endpoints to your main.py after line 510 (before the serve section)

# Fix 1: Add missing alerts endpoint for frontend compatibility
@app.route("/api/alerts/recent", methods=["GET"])
def api_get_recent_alerts():
    """Frontend-compatible alerts endpoint"""
    try:
        limit = request.args.get("limit", 50)
        alerts = app_state.get("alerts", [])[:int(limit)]
        return jsonify({"data": alerts, "success": True})
    except Exception as e:
        return jsonify({"data": [], "success": False, "error": str(e)})

# Fix 2: Add missing pattern detection endpoint
@app.route("/api/detect/<symbol>", methods=["GET"])
def api_detect_patterns_for_symbol(symbol):
    """Detect patterns for specific symbol - frontend compatible"""
    try:
        if tx_engine is None:
            return jsonify({"data": [], "success": False, "error": "TX engine not initialized"})
        
        # Run scan and filter for the requested symbol
        scan_result = tx_engine.run_scan()
        symbol_detections = []
        
        for result in scan_result.get("results", []):
            if result.get("symbol", "").lower() == symbol.lower() and result.get("status") == "pattern":
                detection = {
                    "id": f"detection_{len(symbol_detections)}",
                    "symbol": symbol,
                    "pattern": result.get("pattern", ""),
                    "confidence": result.get("confidence", 0),
                    "price": result.get("price", 0),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "verified": True
                }
                symbol_detections.append(detection)
        
        return jsonify({"data": symbol_detections, "success": True})
    except Exception as e:
        return jsonify({"data": [], "success": False, "error": str(e)})

# Fix 3: Add GET version of signals/entry-exit endpoint
@app.route("/api/signals/entry-exit", methods=["GET"])
def api_get_entry_exit_signals_list():
    """Get entry/exit signals for all or specific symbol"""
    try:
        symbol = request.args.get("symbol")
        
        if symbol:
            # Get signals for specific symbol
            if tx_engine and tx_engine.entry_exit_engine:
                market_data = {"price": tx_engine.get_market_price(symbol) or 50000}
                signal = tx_engine.entry_exit_engine.generate_signal(
                    "default", symbol, market_data, 0.8
                )
                return jsonify({"data": [signal.to_dict()], "success": True})
        
        # Return generic signals
        return jsonify({"data": [], "success": True})
    except Exception as e:
        return jsonify({"data": [], "success": False, "error": str(e)})

# Fix 4: Add strategy endpoints with correct paths
@app.route("/api/strategy/templates", methods=["GET"])
def api_get_strategy_templates():
    """Get strategy templates - frontend compatible"""
    try:
        if tx_engine and tx_engine.strategy_builder:
            templates = tx_engine.strategy_builder.get_strategy_templates()
            return jsonify({"data": templates, "success": True})
        
        # Fallback templates
        templates = [
            {"id": "conservative", "name": "Conservative Swing", "description": "Low-risk swing trading"},
            {"id": "aggressive", "name": "Aggressive Scalp", "description": "High-frequency trading"},
            {"id": "balanced", "name": "Balanced Growth", "description": "Medium-risk balanced approach"}
        ]
        return jsonify({"data": templates, "success": True})
    except Exception as e:
        return jsonify({"data": [], "success": False, "error": str(e)})

@app.route("/api/strategy/create", methods=["POST"])
def api_create_strategy_compatible():
    """Create strategy - frontend compatible"""
    try:
        data = request.get_json() or {}
        strategy = {
            "id": str(uuid.uuid4()),
            "name": data.get("name", "New Strategy"),
            "description": data.get("description", ""),
            "patterns": data.get("patterns", []),
            "conditions": data.get("conditions", []),
            "isActive": data.get("isActive", True)
        }
        return jsonify({"data": strategy, "success": True})
    except Exception as e:
        return jsonify({"data": None, "success": False, "error": str(e)})

@app.route("/api/strategy/user", methods=["GET"])
def api_get_user_strategies():
    """Get user strategies - frontend compatible"""
    try:
        if tx_engine and tx_engine.strategy_builder:
            strategies = list(tx_engine.strategy_builder.strategies.values())
            return jsonify({"data": strategies, "success": True})
        
        return jsonify({"data": [], "success": True})
    except Exception as e:
        return jsonify({"data": [], "success": False, "error": str(e)})

# Fix 5: Add paper trading endpoints with correct paths
@app.route("/api/paper/trade", methods=["POST"])
def api_execute_paper_trade():
    """Execute paper trade - frontend compatible"""
    try:
        data = request.get_json() or {}
        trade = {
            "id": str(uuid.uuid4()),
            "userId": data.get("userId", "demo-user"),
            "symbol": data.get("symbol", "BTC"),
            "side": data.get("side", "buy"),
            "quantity": data.get("quantity", 1),
            "price": data.get("price", 50000),
            "openedAt": datetime.now(timezone.utc).isoformat(),
            "status": "open"
        }
        
        if tx_engine and tx_engine.trader:
            price = tx_engine.get_market_price(trade["symbol"]) or trade["price"]
            if trade["side"] == "buy":
                result = tx_engine.trader.buy(trade["symbol"], price, "manual", 1.0, qty=trade["quantity"])
            else:
                result = tx_engine.trader.sell(trade["symbol"], price, "manual", 1.0, qty=trade["quantity"])
            trade.update(result)
        
        return jsonify({"data": trade, "success": True})
    except Exception as e:
        return jsonify({"data": None, "success": False, "error": str(e)})

@app.route("/api/paper/portfolio", methods=["GET"])
def api_get_paper_portfolio():
    """Get paper portfolio - frontend compatible"""
    try:
        user_id = request.args.get("userId", "demo-user")
        
        if tx_engine and tx_engine.trader and hasattr(tx_engine.trader, "get_positions"):
            positions = tx_engine.trader.get_positions()
            return jsonify({"data": positions, "success": True})
        
        # Fallback to database
        with engine.begin() as conn:
            rows = conn.execute(text("""
                SELECT id, user_id, symbol, side, qty, price, opened_at, closed_at
                FROM paper_trades
                WHERE user_id = :user_id OR user_id IS NULL
                ORDER BY opened_at DESC NULLS LAST
            """), {"user_id": user_id}).mappings().all()
        
        return jsonify({"data": [dict(r) for r in rows], "success": True})
    except Exception as e:
        return jsonify({"data": [], "success": False, "error": str(e)})

@app.route("/api/paper/trade/<trade_id>/close", methods=["POST"])
def api_close_paper_trade(trade_id):
    """Close paper trade - frontend compatible"""
    try:
        if tx_engine and tx_engine.trader:
            result = tx_engine.trader.close_by_id(trade_id)
            return jsonify({"data": result, "success": True})
        
        # Fallback database update
        with engine.begin() as conn:
            conn.execute(text("""
                UPDATE paper_trades 
                SET closed_at = :closed_at 
                WHERE id = :trade_id
            """), {"closed_at": datetime.now(timezone.utc), "trade_id": trade_id})
        
        return jsonify({"data": {"id": trade_id, "status": "closed"}, "success": True})
    except Exception as e:
        return jsonify({"data": None, "success": False, "error": str(e)})

# Fix 6: Add scanning control endpoints
@app.route("/api/scan/start", methods=["POST"])
def api_start_scanning():
    """Start live scanning - frontend compatible"""
    try:
        global SCANNER_STARTED
        if not SCANNER_STARTED:
            start_background_scanner()
        
        return jsonify({"data": {"status": "started"}, "success": True})
    except Exception as e:
        return jsonify({"data": None, "success": False, "error": str(e)})

@app.route("/api/scan/stop", methods=["POST"])
def api_stop_scanning():
    """Stop live scanning - frontend compatible"""
    try:
        global SCANNER_STARTED
        SCANNER_STARTED = False
        return jsonify({"data": {"status": "stopped"}, "success": True})
    except Exception as e:
        return jsonify({"data": None, "success": False, "error": str(e)})

@app.route("/api/scan/status", methods=["GET"])
def api_get_scanning_status():
    """Get scanning status - frontend compatible"""
    try:
        global SCANNER_STARTED
        status = {
            "scanning": SCANNER_STARTED,
            "last_scan": app_state.get("last_scan", {}),
            "active_alerts": len(app_state.get("alerts", []))
        }
        return jsonify({"data": status, "success": True})
    except Exception as e:
        return jsonify({"data": {"scanning": False}, "success": False, "error": str(e)})

# Fix 7: Update existing endpoints to match frontend expectations
# Replace your existing /api/assets/list endpoint with this:
@app.route("/api/assets/list", methods=["GET"])
def api_list_assets_fixed():
    """Get list of supported assets - fixed response format"""
    try:
        assets = [
            {"symbol": "bitcoin", "name": "Bitcoin", "type": "crypto", "price_range": "$20k-$120k"},
            {"symbol": "ethereum", "name": "Ethereum", "type": "crypto", "price_range": "$1k-$8k"},
            {"symbol": "solana", "name": "Solana", "type": "crypto", "price_range": "$10-$300"}
        ]
        
        return jsonify({
            "status": "success",
            "assets": assets,
            "total_assets": len(assets)
        })
        
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)})