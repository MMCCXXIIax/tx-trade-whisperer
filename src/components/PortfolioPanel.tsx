import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { safeFetch } from './TXDashboard';

interface Position {
  symbol?: string;
  ticker?: string;
  qty?: number;
  quantity?: number;
}

interface PortfolioData {
  positions?: Position[];
  open_positions?: Position[];
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
    const json = await safeFetch<PortfolioData | { portfolio?: PortfolioData }>('/api/portfolio');
    if (json) {
      setData((json as any).portfolio || (json as PortfolioData));
    } else {
      setError('Failed to load portfolio');
    }
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
