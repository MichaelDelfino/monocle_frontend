import React from "react";

export const SideBar = props => {
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
    <div className="side-bar d-flex flex-column flex-shrink-0 p-3 bg-light">
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a
            href="#"
            className="nav-link"
            aria-current="page"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "home")}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#"
            className="nav-link link-dark"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "overview")}
          >
            Overview
          </a>
        </li>
        <li>
          <a
            href="#"
            className="nav-link link-dark"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "mach")}
          >
            Machine Display
          </a>
        </li>
        <li>
          <a
            href="#"
            className="nav-link link-dark"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "part")}
          >
            Part Display
          </a>
        </li>
        <li>
          <a
            href="#"
            className="nav-link link-dark"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "list")}
          >
            Run List
          </a>
        </li>
        {/* <li>
          <a
            href="#"
            className="nav-link link-dark"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "stats")}
          >
            Quality Stats
          </a>
        </li> */}

        {/* <li>
          <a
            href="#"
            className="nav-link link-dark"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "mach")}
          >
            Report Generator
          </a>
        </li> */}
        {/* <li>
          <a
            href="#"
            className="nav-link link-dark"
            onMouseEnter={toggleHighlight}
            onMouseLeave={toggleHighlight}
            onClick={props.sectionHandler.bind(null, "options")}
          >
            Options
          </a>
        </li> */}
      </ul>
      <hr />
    </div>
  );
};
