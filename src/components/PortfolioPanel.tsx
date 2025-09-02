import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { safeFetch } from './TXDashboard';
import { supabase } from '@/lib/supabaseClient'; // adjust import path if needed

interface Position {
  symbol?: string;
  ticker?: string;
  qty?: number;
  quantity?: number;
  avg_price?: number;
}

interface PortfolioData {
  positions?: Position[];
  open_positions?: Position[];
  balance?: number;
  invested?: number;
  total_equity?: number;
  realized_pnl?: number;
  unrealized_pnl?: number;
  [key: string]: any;
}

interface PortfolioPanelProps {
  onSelectSymbol?: (sym: string) => void;
}

const PortfolioPanel: React.FC<PortfolioPanelProps> = ({ onSelectSymbol }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const fetchPortfolio = async () => {
    setError(null);

    // 🔹 Get the logged-in user's ID from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      setError('No logged-in user');
      return;
    }

    // 🔹 Pass user_id as query param
    const json = await safeFetch<any>(`/api/portfolio?user_id=${encodeURIComponent(userId)}`);

    if (json) {
      let normalized: PortfolioData | null = null;

      if (Array.isArray(json)) {
        // Raw Supabase array
        normalized = normalizeFromRows(json);
      } else if (Array.isArray(json.portfolio)) {
        // Supabase array wrapped in { portfolio: [...] }
        normalized = normalizeFromRows(json.portfolio);
      } else {
        // Old TXEngine shape
        normalized = json.portfolio || json;
      }

      setData(normalized);
    } else {
      setError('Failed to load portfolio');
    }
  };

  // 🔹 Helper: normalize Supabase rows into positions + computed stats
  const normalizeFromRows = (rows: any[]): PortfolioData => {
    const positions = rows.map((row) => ({
      symbol: row.asset,
      qty: Number(row.quantity),
      avg_price: row.avg_price ? Number(row.avg_price) : undefined
    }));

    // Compute totals
    const invested = positions.reduce((sum, p) => sum + (p.qty ?? 0) * (p.avg_price ?? 0), 0);
    const balance = 0; // could be cash balance if tracked separately
    const total_equity = invested + balance;
    const unrealized_pnl = 0; // placeholder until we have live prices
    const realized_pnl = 0;   // placeholder until we track closed trades

    return {
      positions,
      invested,
      balance,
      total_equity,
      unrealized_pnl,
      realized_pnl
    };
  };

  useEffect(() => {
    fetchPortfolio();
    timerRef.current = setInterval(fetchPortfolio, 15000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  const positions = (data?.positions || data?.open_positions || []) as Position[];

  return (
    <Card className="terminal-container">
      <CardHeader>
        <CardTitle className="text-tx-green text-sm">Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        {!data && !error && (
          <div className="text-xs text-muted-foreground">Loading portfolio…</div>
        )}
        {error && <div className="text-xs text-tx-red">{error}</div>}

        {data && (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(data)
                .filter(([_, v]) => typeof v !== 'object' && v !== null)
                .slice(0, 6)
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="p-2 bg-tx-gray/30 rounded border border-tx-green/10"
                  >
                    <div className="text-muted-foreground">{k.replace(/_/g, ' ')}</div>
                    <div className="trading-numbers font-bold">{String(v)}</div>
                  </div>
                ))}
            </div>

            {/* Positions list */}
            {positions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Positions</div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {positions.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-tx-gray/30 rounded border border-tx-green/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-tx-green/20 text-tx-green border-tx-green/30"
                        >
                          {p.symbol || p.ticker}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          qty {(p.qty ?? p.quantity) ?? '—'}
                        </span>
                      </div>
                      {onSelectSymbol && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => onSelectSymbol(p.symbol || p.ticker || '')}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioPanel;
