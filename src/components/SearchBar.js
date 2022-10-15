import {React, useEffect } from "react";

export const SearchBar = ({ searchHandler, sectionHandler }) => {
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
      if (!li.firstChild.classList.contains("link-dark")) {
        li.firstChild.classList.add("link-dark");
      }
    }
    e.target.classList.remove("link-dark");
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid">
        <div className="menu-items">
          <a
            data-bs-toggle="offcanvas"
            href="#offcanvasExample"
            role="button"
            aria-controls="offcanvasExample"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="black"
              className="menu-button bi bi-list"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
              />
            </svg>
          </a>
          <div
            className="offcanvas offcanvas-start"
            tabIndex="-1"
            id="offcanvasExample"
            aria-labelledby="offcanvasExampleLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasExampleLabel">
                Main Menu
              </h5>
              <hr />
              <button
                type="button"
                className="btn-close text-reset"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <div className="dropdown mt-3">
                <ul className="nav nav-pills flex-column mb-auto">
                  <li className="nav-item">
                    <a
                      href="#"
                      className="nav-link"
                      aria-current="page"
                      data-bs-dismiss="offcanvas"
                      onMouseEnter={toggleHighlight}
                      onMouseLeave={toggleHighlight}
                      onClick={e => {
                        sectionHandler("home");
                        toggleSelected(e);
                      }}
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="nav-link link-dark"
                      data-bs-dismiss="offcanvas"
                      onMouseEnter={toggleHighlight}
                      onMouseLeave={toggleHighlight}
                      onClick={e => {
                        sectionHandler("list");
                        toggleSelected(e);
                      }}
                    >
                      Run List
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="nav-link link-dark"
                      data-bs-dismiss="offcanvas"
                      onMouseEnter={toggleHighlight}
                      onMouseLeave={toggleHighlight}
                      onClick={e => {
                        sectionHandler("list-sum");
                        toggleSelected(e);
                      }}
                    >
                      Summit List
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="nav-link link-dark"
                      data-bs-dismiss="offcanvas"
                      onMouseEnter={toggleHighlight}
                      onMouseLeave={toggleHighlight}
                      onClick={e => {
                        sectionHandler("overview");
                        toggleSelected(e);
                      }}
                    >
                      Overview
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="nav-link link-dark"
                      data-bs-dismiss="offcanvas"
                      onMouseEnter={toggleHighlight}
                      onMouseLeave={toggleHighlight}
                      onClick={e => {
                        sectionHandler("mach");
                        toggleSelected(e);
                      }}
                    >
                      Machine Display
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="nav-link link-dark"
                      data-bs-dismiss="offcanvas"
                      onMouseEnter={toggleHighlight}
                      onMouseLeave={toggleHighlight}
                      onClick={e => {
                        sectionHandler("part");
                        toggleSelected(e);
                      }}
                    >
                      Part Display
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
