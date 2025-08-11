import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PortfolioPanelProps {
  apiBase: string;
  onSelectSymbol?: (sym: string) => void;
}

const PortfolioPanel: React.FC<PortfolioPanelProps> = ({ apiBase, onSelectSymbol }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    const fetchPortfolio = async () => {
      try {
        setError(null);
        const res = await fetch(`${apiBase}/api/portfolio`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setData(json?.portfolio || json);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load portfolio');
      }
    };

    fetchPortfolio();
    timer = window.setInterval(fetchPortfolio, 15000);
    return () => {
      mounted = false;
      if (timer) window.clearInterval(timer);
    };
  }, [apiBase]);

  const positions = (data?.positions || data?.open_positions || []) as any[];

  return (
    <Card className="terminal-container">
      <CardHeader>
        <CardTitle className="text-tx-green text-sm">Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        {!data && !error && (
          <div className="text-xs text-muted-foreground">Loading portfolio…</div>
        )}
        {error && (
          <div className="text-xs text-tx-red">{error}</div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(data)
                .filter(([k, v]) => typeof v !== 'object' && v !== null)
                .slice(0, 6)
                .map(([k, v]) => (
                  <div key={k} className="p-2 bg-tx-gray/30 rounded border border-tx-green/10">
                    <div className="text-muted-foreground">{k.replace(/_/g,' ')}</div>
                    <div className="trading-numbers font-bold">{String(v)}</div>
                  </div>
                ))}
            </div>

            {Array.isArray(positions) && positions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Positions</div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {positions.map((p, idx) => (
                    <div key={idx} className="p-2 bg-tx-gray/30 rounded border border-tx-green/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-tx-green/20 text-tx-green border-tx-green/30">{p.symbol || p.ticker}</Badge>
                        <span className="text-xs text-muted-foreground">qty {(p.qty ?? p.quantity) ?? '—'}</span>
                      </div>
                      {onSelectSymbol && (
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => onSelectSymbol(p.symbol || p.ticker)}>
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
