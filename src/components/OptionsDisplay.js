import React from "react";
import { useState, useEffect } from "react";

// ******* Component not currently in use ********

export default function OptionsDisplay() {
  useEffect(() => {
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
    </div>
  );
}
