import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, ChevronRight, ChevronDown, X } from 'lucide-react';
import { collections } from '../../utils/data';

const EndpointLink = ({ to, method, name, closeSidebar }) => {
    const getMethodColor = (m) => {
        switch(m) {
            case 'POST': return 'text-green-600';
            case 'GET': return 'text-blue-600';
            case 'PUT': return 'text-orange-600';
            case 'DELETE': return 'text-red-600';
            default: return 'text-muted';
        }
    }
    return (
      <li>
        <NavLink 
          to={to} 
          onClick={closeSidebar}
          className={({ isActive }) => `flex items-center group py-1.5 px-2 rounded-md transition-colors ${isActive ? 'bg-accent/10' : 'hover:bg-background'}`}
        >
          <span className={`w-16 text-left text-xs font-bold ${getMethodColor(method)}`}>{method}</span>
          <span className="text-sm text-muted group-hover:text-foreground">{name}</span>
        </NavLink>
      </li>
    );
};

const Collection = ({ collection, searchTerm, closeSidebar }) => {
    const [isOpen, setIsOpen] = useState(true);

    const filteredEndpoints = collection.endpoints.filter(ep => 
        ep.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (searchTerm && filteredEndpoints.length === 0) {
        return null;
    }

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full p-2 text-left rounded-md hover:bg-background">
                <span className="text-sm font-semibold text-foreground">{collection.name}</span>
                <ChevronRight className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <ul className="pl-4 mt-1 ml-2 space-y-1 border-l border-border">
                    {filteredEndpoints.map(endpoint => (
                        <EndpointLink key={endpoint.slug} to={`/endpoint/${endpoint.slug}`} {...endpoint} closeSidebar={closeSidebar} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default function MainSidebar({ isSidebarOpen, closeSidebar }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <aside
      className={`fixed top-0 left-0 z-10 pt-20 md:pt-4 h-full w-72 bg-card border-r border-border p-4 flex flex-col transition-transform duration-300 ease-in-out md:static md:w-[300px] lg:w-80 md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className='flex items-center justify-between mb-4'>
        <NavLink 
          to="/dashboard" 
          end
          className={({ isActive }) => `block py-2 px-3 text-sm font-semibold rounded-md transition-colors flex-grow ${isActive ? 'bg-accent/10 text-accent' : 'bg-footer-bg text-foreground'}`}
        >
          API Overview
        </NavLink>
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Version</label>
        <div className="relative mt-1">
          <button disabled className="flex items-center justify-between w-full py-2 pl-3 pr-2 text-sm text-left border rounded-md cursor-not-allowed bg-background border-border opacity-70">
            <span>1.0.0 (current)</span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 min-h-0 pt-4 border-t border-border">
        <h3 className="mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Endpoints</h3>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Filter endpoints..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 text-sm border-b rounded-md pl-9 pr-3 bg-background focus:outline-none focus:ring-2 focus:ring-accent" 
          />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {collections.map(collection => (
              <Collection key={collection.id} collection={collection} searchTerm={searchTerm} closeSidebar={closeSidebar}/>
          ))}
        </div>
      </div>
    </aside>
  );
}