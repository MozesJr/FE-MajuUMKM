import React, { useState } from "react";
import { Bug, CheckCircle, XCircle } from "lucide-react";

function ApiDebug() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(
        "http://148.230.97.68:3001/api/v1/admin/users",
        {
          headers: {
            accept: "application/json",
            Authorization: "Bearer 62A184M-G7P4QRQ-JJTAMAW-35Z6SFA",
          },
        }
      );

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (response.ok && isJson) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `✅ Connection OK! Found ${data.users?.length || 0} users`,
          data: data,
        });
      } else {
        const text = await response.text();
        setTestResult({
          success: false,
          message: `❌ Error: ${response.status} ${response.statusText}`,
          data: text.substring(0, 500),
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection Failed: ${error.message}`,
        data: error.toString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={testConnection}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-purple-500/20"
      >
        <Bug className="w-4 h-4" />
        <span>Test API</span>
      </button>

      {testResult && (
        <div
          className={`mt-2 p-4 rounded-lg max-w-md ${
            testResult.success
              ? "bg-green-500/20 border border-green-500/50"
              : "bg-red-500/20 border border-red-500/50"
          }`}
        >
          <div className="flex items-start gap-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  testResult.success ? "text-green-200" : "text-red-200"
                }`}
              >
                {testResult.message}
              </p>
              {testResult.data && (
                <pre className="mt-2 text-xs bg-slate-900/50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-2 p-4 bg-slate-800 rounded-lg">
          <p className="text-sm text-purple-300">Testing connection...</p>
        </div>
      )}
    </div>
  );
}

export default ApiDebug;
