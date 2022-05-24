import React from "react";
import { useState, useEffect } from "react";
import DragAndDrop from "./DragAndDrop";

export default function OptionsDisplay() {
  useEffect(() => {
    // Perform get request on page-load
    // fetch("http://localhost:3001/", {
    //   mode: "no-cors", // no-cors : for local origin fetch
    // })
    //   .then((response) => response.json())
    //   .then((data) => console.log(data));
  }, []);

  return (
    <div>
      <div className="OptionsDisplay">
        <div className="jumbotron options-jumbotron">
          <h1 className="display-4 options-display-title">
            Options<span className="blue-period">.</span>
          </h1>
          <p className="lead"></p>
          <hr className="my-4" />
          <p className="lead"></p>
        </div>
      </div>
      {/* <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="flexSwitchCheckDefault"
        />
        <label className="form-check-label" for="flexSwitchCheckDefault">
          <span className="lead my-4">Dark Mode</span>
        </label>
      </div> */}
    </div>
  );
}
