import React, { useEffect } from "react";

export const SearchBar = ({ searchHandler }) => {
  useEffect(() => {});

  const setSearchData = e => {
    if (e) e.preventDefault();

    const [input] = e.target.children;
    const tracking = input.value;

    searchHandler(tracking.trim());
    input.value = "";
  };

  const toggleHighlight = e => {
    e.target.classList.toggle("active");
  };

  const toggleSelected = e => {
    for (const li of e.target.parentNode.parentNode.childNodes) {
      console.log(li.firstChild.classList);
      li.firstChild.classList.remove("link-dark");
    }
    e.target.classList.toggle("link-dark");
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid">
        <div className="menu-items">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="currentColor"
            className="menu-button bi bi-list"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
            />
          </svg>
          <a className="navbar-brand" href="/">
            Winbro - Monocle
          </a>
        </div>

        <form className="d-flex" onSubmit={setSearchData}>
          <input
            id="form-select"
            className="form-control me-2 part-search"
            placeholder="tracking number"
            type="search"
            aria-label="Search"
            required
          />
          <button id="form-select" className="btn btn-outline-primary">
            Search
          </button>
        </form>
      </div>
    </nav>
  );
};
