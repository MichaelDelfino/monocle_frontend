import React, { useEffect } from "react";

export const SearchBar = ({ searchHandler }) => {
  useEffect(() => {});

  const setSearchData = e => {
    if (e) e.preventDefault();

    const [input] = e.target.children;
    const tracking = input.value;

    searchHandler(tracking);
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
        <a className="navbar-brand" href="#">
          Winbro - Monocle
        </a>

        <form className="d-flex" onSubmit={setSearchData}>
          <input
            className="form-control me-2 part-search"
            placeholder="tracking number"
            type="search"
            aria-label="Search"
            required
          />
          <button className="btn btn-outline-primary">Search</button>
        </form>
      </div>
    </nav>
    // <nav className="navbar navbar-light bg-light">
    //   <div className="container-fluid">
    //     <a className="navbar-brand" href="#">
    //       Winbro - Monocle
    //     </a>
    //     <button
    //       className="navbar-toggler"
    //       type="button"
    //       data-bs-toggle="offcanvas"
    //       data-bs-target="#offcanvasNavbar"
    //       aria-controls="offcanvasNavbar"
    //     >
    //       <span className="navbar-toggler-icon"></span>
    //     </button>
    //     <div
    //       className="offcanvas offcanvas-end"
    //       tabindex="-1"
    //       id="offcanvasNavbar"
    //       aria-labelledby="offcanvasNavbarLabel"
    //     >
    //       <div className="offcanvas-header">
    //         <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
    //           Main Menu
    //         </h5>
    //         <button
    //           type="button"
    //           className="btn-close text-reset"
    //           data-bs-dismiss="offcanvas"
    //           aria-label="Close"
    //         ></button>
    //       </div>
    //       <div className="offcanvas-body">
    //         <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
    //           <li className="nav-item">
    //             <a
    //               className="nav-link active"
    //               aria-current="page"
    //               onMouseEnter={toggleHighlight}
    //               onMouseLeave={toggleHighlight}
    //               onClick={props.sectionHandler.bind(null, 'home')}
    //             >
    //               Home
    //             </a>
    //           </li>
    //           <li className="nav-item">
    //             <a
    //               className="nav-link"
    //               onMouseEnter={toggleHighlight}
    //               onMouseLeave={toggleHighlight}
    //               onClick={props.sectionHandler.bind(null, 'part')}
    //             >
    //               Part Display
    //             </a>
    //           </li>
    //           <li className="nav-item dropdown">
    //             <a
    //               className="nav-link"
    //               onMouseEnter={toggleHighlight}
    //               onMouseLeave={toggleHighlight}
    //               onClick={props.sectionHandler.bind(null, 'mach')}
    //             >
    //               Machine Display
    //             </a>
    //           </li>
    //         </ul>
    //         <form className="d-flex" onSubmit={setSearchData}>
    //           <input
    //             className="form-control me-2"
    //             type="search"
    //             placeholder="Search"
    //             aria-label="Search"
    //           />
    //           <button className="btn btn-outline-primary" type="submit">
    //             Search
    //           </button>
    //         </form>
    //       </div>
    //     </div>
    //   </div>
    // </nav>
  );
};
