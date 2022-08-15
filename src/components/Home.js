import React from "react";

export default function Home() {
  return (
    <div className="home-display">
      <div className="jumbotron">
        <h1 className="display-4 home-title">
          Monocle<span className="blue-period">.</span>
        </h1>
        <br />
        <br />
        <br />
        <br />
        <br />
        <p className="lead">A data visualization tool</p>
        <hr className="my-4" />
        <p className="lead version">
          Ver. <span className="version version-num">1.2</span>
        </p>
        <p className="lead">Michael Delfino</p>
        <p className="lead">Jun 2022</p>
        <p className="lead"></p>
      </div>
    </div>
  );
}
