import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import "./App.css";
import { MediaData } from "./api/nasaTypes";

// --- Fetch Helper ---
const fetchResults = async (query: string): Promise<MediaData[]> => {
  const safeQuery = query.trim() === "" ? "apollo" : query;
  const res = await axios.get(`https://images-api.nasa.gov/search?q=${safeQuery}`);
  return res.data.collection.items.map((item: any) => {
    const data = item.data[0];
    const links = item.links ? item.links[0] : null;
    return {
      nasa_id: data.nasa_id,
      title: data.title,
      description: data.description || "No description available.",
      date_created: data.date_created,
      media_type: data.media_type,
      thumbnail: links ? links.href : "",
    };
  });
};

// --- NavBar ---
const NavBar = () => (
  <nav className="navbar">
    <Link to="/">List View</Link>
    <Link to="/gallery">Gallery View</Link>
  </nav>
);

// --- List View ---
const ListView: React.FC<{
  results: MediaData[];
  setResults: React.Dispatch<React.SetStateAction<MediaData[]>>;
}> = ({ results, setResults }) => {
  const [apiQuery, setApiQuery] = useState("apollo");
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "date_created">("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchResults(apiQuery).then(setResults);
  }, [apiQuery, setResults]);

  const filtered = results
    .filter((r) => r.title.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortKey].toLowerCase();
      const valB = b[sortKey].toLowerCase();
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="list-view">
      <h2>🚀 NASA List View</h2>

      <div className="search-container">
        <input
          type="text"
          value={apiQuery}
          onChange={(e) => setApiQuery(e.target.value)}
          placeholder="Search from NASA API..."
        />
        <button onClick={() => fetchResults(apiQuery).then(setResults)}>🔍 Fetch</button>
      </div>

      <div className="sort-controls">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter within results..."
          className="filter-bar"
        />

        <label>Sort by: </label>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
          <option value="title">Title</option>
          <option value="date_created">Date</option>
        </select>
        <button onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>
          {order === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
        </button>
      </div>

      <ul className="list">
        {paginated.map((item, i) => (
          <li key={i} className="list-item">
            <Link to={`/details/${item.nasa_id}`} state={{ results, index: i }}>
              <div className="list-info">
                <img src={item.thumbnail} alt={item.title} />
                <h3>{item.title}</h3>
                <p>{item.date_created.slice(0, 10)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ⬅️ Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next ➡️
        </button>
      </div>
    </div>
  );
};

// --- Gallery View ---
const GalleryView: React.FC<{
  results: MediaData[];
  setResults: React.Dispatch<React.SetStateAction<MediaData[]>>;
}> = ({ results, setResults }) => {
  const [apiQuery, setApiQuery] = useState("apollo");
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("image");
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchResults(apiQuery).then(setResults);
  }, [apiQuery, setResults]);

  const filtered = results
    .filter((r) => r.media_type === filterType)
    .filter((r) => r.title.toLowerCase().includes(filter.toLowerCase()));

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="gallery-view">
      <h2>🪐 NASA Gallery View</h2>

      <div className="search-container">
        <input
          type="text"
          value={apiQuery}
          onChange={(e) => setApiQuery(e.target.value)}
          placeholder="Search from NASA API..."
        />
        <button onClick={() => fetchResults(apiQuery).then(setResults)}>🔍 Fetch</button>
      </div>

      <div className="sort-controls">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter within results..."
          className="filter-bar"
        />

        <label>Filter: </label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      <div className="gallery">
        {paginated.map((item, i) => (
          <div key={i} className="gallery-item">
            <Link to={`/details/${item.nasa_id}`} state={{ results, index: i }}>
              <img src={item.thumbnail} alt={item.title} />
              <p>{item.title}</p>
            </Link>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ⬅️ Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next ➡️
        </button>
      </div>
    </div>
  );
};

// --- Detail View ---
const DetailView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { results, index } = (location.state as { results: MediaData[]; index: number }) || {
    results: [],
    index: 0,
  };
  const item = results[index];

  if (!item) return <p>Item not found.</p>;

  const handleNav = (dir: number) => {
    const newIndex = index + dir;
    if (newIndex >= 0 && newIndex < results.length) {
      navigate(`/details/${results[newIndex].nasa_id}`, { state: { results, index: newIndex } });
    }
  };

  return (
    <div className="detail-view">
      <h2>{item.title}</h2>
      <img src={item.thumbnail} alt={item.title} className="detail-img" />
      <p>
        <strong>Date:</strong> {item.date_created}
      </p>
      <p>{item.description}</p>
      <div className="nav-buttons">
        <button onClick={() => handleNav(-1)}>⬅️ Previous</button>
        <button onClick={() => handleNav(1)}>Next ➡️</button>
      </div>
    </div>
  );
};

// --- App ---
const App: React.FC = () => {
  const [results, setResults] = useState<MediaData[]>([]);
  return (
    <Router basename="/CS409-mp2">
      <div className="App">
        <h1>🌌 NASA Explorer</h1>
        <NavBar />
        <Routes>
          <Route path="/" element={<ListView results={results} setResults={setResults} />} />
          <Route path="/gallery" element={<GalleryView results={results} setResults={setResults} />} />
          <Route path="/details/:nasa_id" element={<DetailView />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
