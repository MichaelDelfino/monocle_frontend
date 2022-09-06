import React, { useEffect, useState } from "react";
import { SearchBar } from "./components/SearchBar";
import Home from "./components/Home";
import PartDisplay from "./components/PartDisplay";
import MachineDisplay from "./components/MachineDisplay";
import Overview from "./components/Overview";
import RunList from "./components/RunList";
import SummitList from "./components/SummitList";

export default function App() {
  const [pageData, setPageData] = useState({
    section: "home",
    tracking: "",
    machine: "WAM 101",
    parttype: "369P-01",
    side: "c-side",
    metric: "Diameter",
    startDate: Date.now(),
  });

  useEffect(() => {
    setPageData({
      section: pageData.section,
      tracking: pageData.tracking,
      machine: "WAM 101",
      parttype: "369P-01",
      side: "c-side",
      metric: "Diameter",
      startDate: Date.now(),
    });

    // resize list-display height to fix scaling bug
    // ONLY if page is selected...breaks otherwise
    if (pageData.section === "list") {
      const listDisplay = document.querySelector(".list-display");
      listDisplay.style.height = "100%";
    } else {
      const listDisplay = document.querySelector(".list-display");
      listDisplay.style.height = null;
    }
    if (pageData.section === "list-sum") {
      const listDisplay = document.querySelector(".list-display-sum");
      listDisplay.style.height = "100%";
    } else {
      const listDisplay = document.querySelector(".list-display-sum");
      listDisplay.style.height = null;
    }
  }, [pageData.section]);

  const updateSection = section => {
    setPageData(prevState => {
      return {
        ...prevState,
        section: section,
      };
    });
  };

  const searchHandler = tracking => {
    if (tracking) {
      setPageData(prevState => {
        return {
          ...prevState,
          section: "part",
          tracking: tracking,
        };
      });
    }
  };

  // name confusing...
  const machHandler = (mach, parttype, side, metric, startDate) => {
    if (mach) {
      setPageData({
        section: "mach",
        tracking: "",
        machine: mach,
        parttype: parttype,
        side: side,
        metric: metric,
        startDate: startDate,
      });
    }
  };

  return (
    <div className="App">
      <div className="search-bar">
        <SearchBar
          searchHandler={searchHandler}
          sectionHandler={updateSection}
        />
      </div>
      <div id="blue-strip" className="blue-strip"></div>
      <div className="content">
        {/* <div className="side-bar">
          <SideBar sectionHandler={updateSection} />
        </div> */}
        {pageData ? (
          <div className="data-display">
            <div className="home-display">
              {pageData.section === "home" ? <Home /> : null}
            </div>
            <div className="part-display">
              {pageData.section === "part" ? (
                <PartDisplay tracking={pageData.tracking} />
              ) : null}
            </div>{" "}
            <div className="list-display">
              {pageData.section === "list" ? (
                <RunList
                  machine={pageData.machine}
                  parttype={pageData.parttype}
                  side={pageData.side}
                  metric={pageData.metric}
                  startDate={pageData.startDate}
                />
              ) : null}
            </div>{" "}
            <div className="list-display-sum">
              {pageData.section === "list-sum" ? <SummitList /> : null}
            </div>
            <div className="mach-display">
              {pageData.section === "mach" ? (
                <MachineDisplay
                  searchHandler={searchHandler}
                  machine={pageData.machine}
                  parttype={pageData.parttype}
                  side={pageData.side}
                  metric={pageData.metric}
                  startDate={pageData.startDate}
                />
              ) : null}
            </div>
            <div className="overview-display">
              {pageData.section === "overview" ? (
                <Overview
                  machHandler={machHandler}
                  searchHandler={searchHandler}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
