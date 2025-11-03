import React, { useState, useEffect } from 'react';
import Button from './Button';
import { runDiagnostics, formatDiagnostics, DiagnosticResult } from '../../utils/supabaseDiagnostics';

interface SupabaseDiagnosticsProps {
    isVisible?: boolean;
    onClose?: () => void;
}

export const SupabaseDiagnostics: React.FC<SupabaseDiagnosticsProps> = ({
    isVisible = false,
    onClose
}) => {
    const [diagnostics, setDiagnostics] = useState<{
        connectivity: DiagnosticResult;
        cors: DiagnosticResult;
        auth: DiagnosticResult;
    } | null>(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isVisible) {
            runTests();
        }
    }, [isVisible]);

    const runTests = async () => {
        setRunning(true);
        setError(null);

        try {
            const results = await runDiagnostics();
            setDiagnostics(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
        } finally {
            setRunning(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">🔍 Supabase Connection Diagnostics</h2>
                    {onClose && (
                        <Button
                            onClick={onClose}
                            variant="outline"
                            size="sm"
                        >
                            ✕ Close
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={runTests}
                        disabled={running}
                        className="w-full"
                    >
                        {running ? '⏳ Running Tests...' : '🚀 Run Tests'}
                    </Button>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 rounded">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {diagnostics && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded border">
                                <h3 className="font-semibold mb-2">📊 Test Results</h3>
                                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                                    {formatDiagnostics(diagnostics)}
                                </pre>
                            </div>

                            <div className="bg-blue-50 p-4 rounded border">
                                <h3 className="font-semibold mb-2">💡 Quick Fixes</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Check your <code>.env</code> file has correct Supabase credentials</li>
                                    <li>• Verify your Supabase project is active and not paused</li>
                                    <li>• Ensure your domain is allowed in Supabase CORS settings</li>
                                    <li>• Clear browser cache and try refreshing the page</li>
                                    <li>• Check your internet connection</li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded border">
                                <h3 className="font-semibold mb-2">🛠️ Environment Variables</h3>
                                <div className="text-sm space-y-1">
                                    <div>URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
                                    <div>Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component to show a subtle diagnostics trigger in development
export const DiagnosticsTrigger: React.FC = () => {
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    // Only show in development or when URL contains debug param
    const shouldShow = import.meta.env.DEV ||
        window.location.search.includes('debug=true') ||
        window.location.hash.includes('debug');

    if (!shouldShow) return null;

    return (
        <>
            <Button
                onClick={() => setShowDiagnostics(true)}
                variant="outline"
                size="sm"
                className="fixed bottom-4 right-4 z-40 bg-white shadow-lg"
            >
                🔍 Debug
            </Button>

            <SupabaseDiagnostics
                isVisible={showDiagnostics}
                onClose={() => setShowDiagnostics(false)}
            />
        </>
    );
};