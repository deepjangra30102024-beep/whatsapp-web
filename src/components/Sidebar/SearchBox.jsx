import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchBox = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="search-container">
      <div className="search-box">
        <Search size={18} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search or start new chat" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button style={{ marginLeft: '8px', padding: '4px' }}>
        <Filter size={18} />
      </button>
    </div>
  );
};

export default SearchBox;
