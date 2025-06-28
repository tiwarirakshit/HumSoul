import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { ScrollArea } from './scroll-area';

interface NetworkLog {
  id: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  timestamp: string;
  type: 'request' | 'response' | 'error';
  data?: string;
}

export function NetworkDebug() {
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Override console.log to capture API logs
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog.apply(console, args);
      
      const message = args.join(' ');
      if (message.includes('🚀 API Request:') || message.includes('✅ API Response:') || message.includes('❌ API Error:')) {
        try {
          const logData = args[1] || {};
          const log: NetworkLog = {
            id: Date.now().toString(),
            method: logData.method || 'GET',
            url: logData.fullUrl || logData.url || 'Unknown',
            status: logData.status,
            duration: logData.duration,
            timestamp: logData.timestamp || new Date().toISOString(),
            type: message.includes('🚀') ? 'request' : message.includes('✅') ? 'response' : 'error',
            data: logData.data
          };
          
          setLogs(prev => [log, ...prev.slice(0, 49)]); // Keep last 50 logs
        } catch (error) {
          // Ignore parsing errors
        }
      }
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      
      const message = args.join(' ');
      if (message.includes('❌ API Error:')) {
        try {
          const logData = args[1] || {};
          const log: NetworkLog = {
            id: Date.now().toString(),
            method: logData.method || 'GET',
            url: logData.fullUrl || logData.url || 'Unknown',
            timestamp: logData.timestamp || new Date().toISOString(),
            type: 'error',
            data: logData.error
          };
          
          setLogs(prev => [log, ...prev.slice(0, 49)]);
        } catch (error) {
          // Ignore parsing errors
        }
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 400 && status < 500) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'request': return 'bg-blue-500';
      case 'response': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 hover:bg-blue-600"
        size="sm"
      >
        🔍 Network Debug
      </Button>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-4xl max-h-[80vh]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Network Debug Logs</CardTitle>
            <div className="flex gap-2">
              <Button onClick={clearLogs} variant="outline" size="sm">
                Clear
              </Button>
              <Button onClick={() => setIsVisible(false)} size="sm">
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No network logs yet. Make some API calls to see them here.
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(log.type)}>
                        {log.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{log.method}</Badge>
                      {log.status && (
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      )}
                      {log.duration && (
                        <Badge variant="outline">{log.duration}ms</Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm font-mono break-all">
                      {log.url}
                    </div>
                    {log.data && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {log.data}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 