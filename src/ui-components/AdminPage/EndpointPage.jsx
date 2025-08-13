import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Save, X, ChevronDown, AlertCircle, Edit,
} from "lucide-react";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import ApiResponseViewer from "./ApiResponseViewer";
import { removeUserInfo } from "../../auth/authSlice";
import { fetchCredits } from "../../auth/userSlice";
import UpgradeModal from "../UpgradeModal";

const getMethodClass = (method) => {
  switch (method?.toUpperCase()) {
    case "GET": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "POST": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "PUT": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "PATCH": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "DELETE": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

const TabButton = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`py-3 px-4 text-sm font-medium border-b-2 flex-shrink-0 transition-colors ${isActive ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
    {label}
  </button>
);

const ParameterRow = ({paramKey, value, isEditing, onValueChange, placeholder, description}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-x-4 gap-y-2 py-3">
    <div className="font-mono text-sm text-foreground flex flex-col">
      <span>{paramKey}</span>
      {description && (<span className="text-xs text-muted-foreground mt-1 font-sans">{description}</span>)}
    </div>
    <div className="md:col-span-2">
      <input type="text" value={value || ""} readOnly={!isEditing} onChange={onValueChange} placeholder={placeholder}
        className={`w-full bg-background py-2 px-3 text-foreground font-mono text-sm border rounded-md focus:outline-none ${isEditing ? "border-accent focus:ring-1 focus:ring-accent" : "border-border cursor-default"}`}/>
    </div>
  </div>
);

const SubTab = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`px-3 py-1 text-sm rounded-md ${isActive ? "bg-accent/10 text-accent font-semibold" : "text-muted-foreground hover:bg-footer-bg"}`}>
    {label}
  </button>
);

const RequestBodyEditor = ({endpoint, editData, isEditing, onBodyChange, onMediaTypeChange}) => {
  const [view, setView] = useState("Body");
  const mediaTypes = ["application/json", "text/plain", "application/xml"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center p-1 bg-background rounded-md space-x-1 flex-shrink-0">
          <SubTab label="Body" isActive={view === "Body"} onClick={() => setView("Body")}/>
          <SubTab label="Schema" isActive={view === "Schema"} onClick={() => setView("Schema")}/>
        </div>
        {view === "Body" && isEditing && (
          <div className="relative w-full sm:w-auto">
            <select
              onChange={onMediaTypeChange}
              defaultValue={editData.headers.find(h => h.key.toLowerCase() === 'content-type')?.value}
              className="w-full pl-3 pr-8 py-1.5 text-sm border border-border rounded-md appearance-none focus:outline-none bg-background">
              {mediaTypes.map((type) => ( <option key={type}>{type}</option>))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>
      {view === "Body" && (isEditing ? (
          <textarea value={editData.body} onChange={onBodyChange} rows={8} className="w-full bg-background p-4 font-mono text-sm text-foreground border-accent focus:ring-accent focus:outline-none rounded-md"/>
        ) : (
          <pre className="bg-background border border-border rounded-md p-4 font-mono text-sm text-foreground whitespace-pre-wrap break-all">{editData.body}</pre>
        ))}
      {view === "Schema" && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-10 bg-background p-3 font-semibold text-sm border-b border-border">
            <div className="col-span-3">Field</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-5">Description</div>
          </div>
          <div className="divide-y divide-border">
            {endpoint.requestSchema.map((field, index) => (
              <div key={field.field} className={`grid grid-cols-10 p-3 text-sm ${index % 2 !== 0 ? "bg-background/50" : ""}`}>
                <div className="col-span-3 font-mono text-foreground">
                  {field.field}
                  {field.required && <span className="text-accent ml-1">*</span>}
                </div>
                <div className="col-span-2 font-mono text-muted-foreground">{field.type}</div>
                <div className="col-span-5 text-muted-foreground">{field.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyStateMessage = ({ message }) => (
  <div className="text-center py-16 flex flex-col items-center justify-center text-muted-foreground">
    <AlertCircle className="mb-4 h-8 w-8 text-accent" strokeWidth={1.5} />
    <p className="text-sm">{message}</p>
  </div>
);

const InitialStateViewer = () => (
  <div className="bg-card border border-border rounded-lg h-full p-6 flex flex-col">
    <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
      <svg className="w-16 h-16 mb-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
      <p className="font-semibold text-foreground">Ready to Test</p>
      <p className="text-sm mt-1">Configure your request and click "Test Endpoint" to see a response.</p>
    </div>
  </div>
);

export default function EndpointPage({ endpoint }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ params: [], headers: [], body: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeRequestTab, setActiveRequestTab] = useState("Params");
  
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const remainingCredits = useSelector((state) => state.user.creditsInfo?.remainingCredits);
  
  const Hash = useSelector((state) => state.auth.userInfo?.profile?.client?.[0]?.hash); 
  const token = useSelector((state) => state.auth.userToken);
  const dispatch = useDispatch();

  useEffect(() => {
    if (endpoint) {
      setEditData({
        params: JSON.parse(JSON.stringify(endpoint.params || [])),
        headers: JSON.parse(JSON.stringify(endpoint.headers || [])),
        body: endpoint.body || "",
      });
      setIsEditing(false);
      setTestResult(null);
      setActiveRequestTab(endpoint.params?.length > 0 ? "Parameters" : "Body");
    }
  }, [endpoint]);

  const handleTestEndpoint = async () => {
    if (typeof remainingCredits === 'number' && remainingCredits <= 0) {
      setIsCreditModalOpen(true);
      return;
    }

    setIsLoading(true);
    setTestResult(null);
    const startTime = performance.now();

    const headers = Object.fromEntries(
      editData.headers.map((h) => [h.key, h.value])
    );

    if (Hash) headers['x-auth-token'] = Hash;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let urlTemplate = endpoint.url;
    const queryParams = new URLSearchParams();
    editData.params?.forEach((p) => {
      if (p.value) {
        p.in === "path"
          ? (urlTemplate = urlTemplate.replace(`{${p.key}}`, p.value))
          : queryParams.append(p.key, p.value);
      }
    });

    const finalUrl = queryParams.toString() ? `${urlTemplate}?${queryParams.toString()}` : urlTemplate;
    const requestOptions = {
      method: endpoint.method,
      headers,
      body: endpoint.method !== "GET" && editData.body ? editData.body : undefined,
    };

    try {
      const response = await fetch(finalUrl, requestOptions);

      if (response.status === 401) {
        toast.success("Your session has expired. Please log in again.");
        dispatch(removeUserInfo());
        return; 
      }

      const endTime = performance.now();
      const total = Math.round(endTime - startTime);
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json") ? await response.json() : await response.text();
      
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        timing: { total },
        bodySize: new Blob([JSON.stringify(responseData)]).size,
        data: responseData,
      });
      dispatch(fetchCredits());
    } catch (error) {
      const endTime = performance.now();
      setTestResult({
        isError: true,
        status: "Error",
        statusText: "Failed to Fetch",
        timing: { total: Math.round(endTime - startTime) },
        data: {
          message: error.message,
          details: "Could not connect to the API. Check the URL and server status.",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (type, index, field, value) => {
    const updated = [...editData[type]];
    updated[index][field] = value;
    setEditData((prev) => ({ ...prev, [type]: updated }));
  };

  const handleMediaTypeChange = (e) => {
    const newType = e.target.value;
    const headers = [...editData.headers];
    const contentTypeIndex = headers.findIndex( (h) => h.key.toLowerCase() === "content-type");
    if (contentTypeIndex !== -1) headers[contentTypeIndex].value = newType;
    else headers.push({ key: "Content-Type", value: newType });
    setEditData((prev) => ({ ...prev, headers }));
  };

  if (!endpoint) return null;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <UpgradeModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title="You're Out of Credits"
        message="Your API call was blocked because you have no credits left. Please add more to continue testing."
        buttonText="Add More Credits"
      />

      <header className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-sm font-bold px-3 py-1 rounded-md border ${getMethodClass(endpoint.method)}`}>
              {endpoint.method}
            </span>
            <h1 className="text-xl font-bold text-foreground truncate">
              {endpoint.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-sm font-semibold text-foreground bg-background rounded-md hover:bg-footer-bg flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="px-3 py-2 text-sm font-semibold text-foreground bg-background rounded-md hover:bg-footer-bg flex items-center gap-2">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={handleTestEndpoint} disabled={isLoading} className="px-4 sm:px-6 py-2 font-semibold text-white bg-accent rounded-md hover:bg-accent-hover disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading ? (<><Spinner small /> Testing...</>) : ("Test Endpoint")}
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-3 bg-background p-2 rounded-md border border-border break-all">
          {endpoint.url}
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <section className="bg-card border rounded-lg flex flex-col min-h-[400px] lg:min-h-0 overflow-hidden">
          <div className={`border-b border-border flex-shrink-0 ${isEditing ? "bg-accent/5" : ""}`}>
            <nav className="flex space-x-1 -mb-px px-2 overflow-x-auto">
              {["Parameters", "Headers", "Authorization", "Body"].map((tab) => (
                <TabButton key={tab} label={tab} isActive={activeRequestTab === tab} onClick={() => setActiveRequestTab(tab)}/>
              ))}
            </nav>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto">
            {activeRequestTab === "Parameters" && (editData.params?.length > 0 ? (
                <div className="divide-y divide-border -my-3">
                  {editData.params.map((p, i) => (
                    <ParameterRow key={i} paramKey={p.key} value={p.value} isEditing={isEditing} onValueChange={(e) => handleEditChange("params", i, "value", e.target.value)} placeholder={p.in} description={p.description}/>
                  ))}
                </div>
              ) : ( <EmptyStateMessage message="This endpoint has no parameters." />)
            )}
            {activeRequestTab === "Headers" && (editData.headers?.length > 0 ? (
                <div className="divide-y divide-border -my-3">
                  {editData.headers.map((h, i) => (
                    <ParameterRow key={i} paramKey={h.key} value={h.value} isEditing={isEditing} onValueChange={(e) => handleEditChange("headers", i, "value", e.target.value)}/>
                  ))}
                </div>
              ) : ( <EmptyStateMessage message="No headers are defined for this request." />)
            )}
            {activeRequestTab === "Authorization" && (
              <div className="space-y-2 text-foreground">
                <h3 className="font-bold">{endpoint.auth.type}</h3>
                <p className="text-sm text-muted-foreground">{endpoint.auth.details}</p>
              </div>
            )}
            {activeRequestTab === "Body" && (endpoint.body || endpoint.requestSchema?.length > 0 ? (
                <RequestBodyEditor endpoint={endpoint} editData={editData} isEditing={isEditing} onBodyChange={(e) => setEditData((p) => ({ ...p, body: e.target.value }))} onMediaTypeChange={handleMediaTypeChange}/>
              ) : ( <EmptyStateMessage message="This request does not have a body." />)
            )}
          </div>
        </section>

        <section className="min-h-[400px] md:pb-0 pb-5 lg:min-h-0">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full bg-card border-border border rounded-lg">
              <Spinner large />
              <p className="mt-4 text-muted-foreground">Sending request...</p>
            </div>
          )}
          {!isLoading && !testResult && (
            <InitialStateViewer />
          )}
          {!isLoading && testResult && (testResult.isError ? (
              <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg p-4 h-full overflow-y-auto">
                <div className="flex items-center gap-2 font-bold mb-2 text-accent">
                  <AlertCircle /> {testResult.statusText}
                </div>
                <pre className="text-sm bg-background/30 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            ) : (
              <ApiResponseViewer result={testResult} />
            )
          )}
        </section>
      </div>
    </div>
  );
}