import React, { useEffect, useState } from "react";
import DragAndDrop from "./DragAndDrop";
import { LineGraph } from "./LineGraph";
import { ScatterPlot } from "./ScatterPlot";
import { MetricHighlights } from "./MetricHighlights";

export default function PartDisplay(props) {
  const [partData, setPartData] = useState(null);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  class Part {
    constructor(headerInfo, cSideData, aSideData, aFlipData, tolerances) {
      this.machine = headerInfo.machine;
      this.parttype = headerInfo.partType;
      this.tracking = headerInfo.tracking;
      this.timestamp = headerInfo.date;
      this.csidedata = cSideData;
      this.asidedata = aSideData;
      this.aflipdata = aFlipData;
      this.tolerances = tolerances;
    }
  }

  useEffect(() => {
    console.log(props.tracking);
    // Set development environments to fetch localhost instead of hosted server
    // let url = "";
    // if (process.env.NODE_ENV === "development") {
    //   url = `http://localhost:3001/parts/?tracking=${props.tracking}`;
    // } else {
    //   url = `https://salty-inlet-93542.herokuapp.com/parts/?tracking=${props.tracking}`;
    // }

    const abortController = new AbortController();

    fetch(
      `https://salty-inlet-93542.herokuapp.com/parts/?tracking=${props.tracking}`,
      {
        signal: abortController.signal,
      }
    )
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log("...found", data[0]);
        if (data[0] === undefined) {
          setPartData(null);
        } else {
          setPartData({
            part: data[0],
            metric: "diameter",
            side: "c-side",
            order: "insp",
            measureMode: false,
          });
        }
      })
      .catch(error => {
        console.log("tracking error", error);
        if (error.name === "AbortError") {
          console.log(error);
        }
      });
    return () => {
      abortController.abort();
    };
  }, [props.tracking]);

  // File Drag-and-Drop Functionality
  const onDrop = file => {
    // init csideonly and modified time
    let cSideOnly = false;
    const mtime = file[0].lastModified;

    if (file[0].name.includes("C_SideOnly")) {
      cSideOnly = true;
    } else {
      cSideOnly = false;
    }

    const data = file[0].text().then(text => {
      const lines = text.split(/\r?\n/);
      // console.log(lines);
      const partPromise = tfParser(lines, mtime, cSideOnly);
      partPromise.then(part => {
        console.log(part);
        setPartData({
          part: part,
          metric: "diameter",
          side: "c-side",
          order: "insp",
          measureMode: false,
        });
      });
    });
  };

  // Parse first few lines and get header information from text file
  const getHeaderInfo = (textFile, mtime) => {
    var count = 0;
    var headerInfo = {};
    var version, partType, machine, tracking, date, summit;

    for (const line of textFile) {
      if (count === 0) {
        if (String(line.substring(20, 23)) === "809") {
          partType = "1565P-01";
        } else if (String(line.substring(20, 23)) === "887") {
          partType = "1787P-01";
        } else if (line.includes("817P")) {
          partType = "817P-01";
        } else if (line.includes("-317-")) {
          partType = "317P-01";
        } else if (line.includes("-109-")) {
          partType = "109";
        } else {
          partType = String(line.substring(9, 17)).trim();
        }
        // Get version number
        version = String(
          line.substring(line.indexOf("PR_") + 3, line.indexOf("PR_") + 6)
        );
      }
      date = mtime;

      if (count === 2) {
        summit = String(line.substring(75, 100)).trim();
        if (summit === "S625XP11091449") {
          summit = "Summit_1";
        } else if (summit === "S600XP21031901") {
          summit = "Summit_2";
        } else {
          summit = "Summit_3";
        }
      }

      if (count === 4) {
        machine = "WAM " + String(line.substring(55, 58));
        tracking = String(line.substring(79, 90)).trim();
      }

      if (count > 5) {
        headerInfo.version = version;
        headerInfo.partType = partType;
        headerInfo.date = date;
        headerInfo.summit = summit;
        headerInfo.machine = machine;
        headerInfo.tracking = tracking;
        break;
      }
      count += 1;
    }
    return headerInfo;
  };

  // Retrieve text file specification from partDefinitions config file
  const getTextFileSpecs = async (currentType, version, cSideOnly) => {
    const defFile = "./config/partDefinitions.json";

    const response = await fetch(defFile);
    const partDef = await response.json();

    for (const part of partDef) {
      if (
        String(part.partType).trim() === String(currentType).trim() &&
        cSideOnly === part.textFileSpecs.cSideOnly &&
        String(part.textFileSpecs.version).trim() === String(version).trim()
      ) {
        let textFileSpecs,
          tolerances = {};
        textFileSpecs = part.textFileSpecs;
        tolerances = part.tolerances;

        return [textFileSpecs, tolerances];
      }
    }
  };

  // Get hole data from text file based on specs
  const getPartData = (textFileSpecs, textFile) => {
    var cSideData = {};
    var aSideData = {};
    var aFlipData = {};

    var lineCount = 0;
    var holeCount = 1;

    for (const line of textFile) {
      // C Side Data
      // Create array of angle hole "signifiers" to look for
      if (!line.includes("Ellipse")) {
        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cDia = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cXY = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cX = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cY = String(line.substring(28, 36)).trim();
          cSideData[`hole_${holeCount}`] = {
            cDia: cDia,
            cXY: cXY,
            cX: cX,
            cY: cY,
          };
          holeCount++;
        }
      }

      // C-Side angle hole data
      if (line.includes("Ellipse")) {
        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.truePosString) +
            textFileSpecs.truePosString.length +
            2;
          cXY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.xPosString) +
            textFileSpecs.xPosString.length +
            2;
          cX = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.yPosString) +
            textFileSpecs.yPosString.length +
            2;
          cY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.diaString) +
            textFileSpecs.diaString.length +
            2;
          cDia = String(line.substring(startIndex, startIndex + 8)).trim();
          cSideData[`hole_${holeCount}`] = {
            cDia: cDia,
            cXY: cXY,
            cX: cX,
            cY: cY,
          };
          holeCount++;
        }
      }

      // A Side Data
      // reset hole count at A side
      if (!textFileSpecs.cSideOnly) {
        if (lineCount === textFileSpecs.cEnd + 1) {
          holeCount = 1;
        }

        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aDia = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aXY = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aX = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aY = String(line.substring(28, 36)).trim();
          aSideData[`hole_${holeCount}`] = {
            aDia: aDia,
            aXY: aXY,
            aX: aX,
            aY: aY,
          };
          holeCount++;
        }
      }

      // A Flip Data
      if (textFileSpecs.includeAFlip) {
        if (!line.includes("Ellipse")) {
          // reset hole count at a-flip data
          if (lineCount === textFileSpecs.aEnd + 1) {
            holeCount = 1;
          }
          if (
            line.includes(textFileSpecs.diaString) &&
            lineCount > textFileSpecs.aEnd
          ) {
            var aFlipDia = String(line.substring(28, 36)).trim();

            aFlipData[`hole_${holeCount}`] = {
              aFlipDia: aFlipDia,
            };
            holeCount++;
          }
        }
      }
      if (line.includes("Ellipse")) {
        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.truePosString) +
            textFileSpecs.truePosString.length +
            2;
          aXY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.xPosString) +
            textFileSpecs.xPosString.length +
            2;
          aX = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.yPosString) +
            textFileSpecs.yPosString.length +
            2;
          aY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.diaString) +
            textFileSpecs.diaString.length +
            2;
          aDia = String(line.substring(startIndex, startIndex + 8)).trim();
          aSideData[`hole_${holeCount}`] = {
            aDia: aDia,
            aXY: aXY,
            aX: aX,
            aY: aY,
          };
          holeCount++;
        }
      }

      lineCount++;
    }
    return [cSideData, aSideData, aFlipData];
  };

  const getPartColor = partType => {
    let borderColor = "";
    let backgroundColor = "";

    if (String(partType).trim() === "369P-01") {
      borderColor = "rgb(252, 186, 3, 1)";
      backgroundColor = "rgb(252, 186, 3, .2)";
    } else if (String(partType).trim() === "1789P-01") {
      borderColor = "rgb(2, 117, 216, 1)";
      backgroundColor = "rgb(2, 117, 216, .2)";
    } else if (String(partType).trim() === "2078P-01") {
      borderColor = "rgb(92, 184, 92, 1)";
      backgroundColor = "rgb(92, 184, 92, .2)";
    } else if (String(partType).trim() === "1534P-01") {
      borderColor = "rgb(219, 112, 4, 1)";
      backgroundColor = "rgb(219, 112, 4, .2)";
    } else if (String(partType).trim() === "1557P-01") {
      borderColor = "rgb(68, 242, 207, 1)";
      backgroundColor = "rgb(68, 242, 207, .2)";
    } else if (String(partType).trim() === "2129P-01") {
      borderColor = "rgb(252, 3, 102, 1)";
      backgroundColor = "rgb(252, 3, 102, .2)";
    } else if (String(partType).trim() === "2129P-02") {
      borderColor = "rgb(175, 104, 252, 1)";
      backgroundColor = "rgb(175, 104, 252, .2)";
    } else if (String(partType).trim() === "2129P-03") {
      borderColor = "rgb(1, 0, 3, 1)";
      backgroundColor = "rgb(1, 0, 3, .2)";
    } else if (String(partType).trim() === "1565P-01") {
      borderColor = "rgb(171, 194, 21, 1)";
      backgroundColor = "rgb(171, 194, 21, .2)";
    }

    return [borderColor, backgroundColor];
  };

  const changeMetric = e => {
    const metric = e.target.value;
    setPartData(prevState => {
      return { ...prevState, metric: metric };
    });
  };

  const tfParser = async (textFile, mtime, cSideOnly) => {
    //Get header info from text file
    const headerInfo = getHeaderInfo(textFile, mtime);

    //Get line numbers and other file specifics for given part type
    const [textFileSpecs, tolerances] = await getTextFileSpecs(
      headerInfo.partType,
      headerInfo.version,
      cSideOnly
    );

    //Create data objects for each section of the part
    const [cSideData, aSideData, aFlipData] = getPartData(
      textFileSpecs,
      textFile
    );

    //Create part object with all metrics
    const part = new Part(
      headerInfo,
      cSideData,
      aSideData,
      aFlipData,
      tolerances
    );
    return part;
  };

  const importTest = async partData => {
    console.log(partData.tracking);
    const response = await fetch(`http://localhost:3001/parts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(partData),
    });
    const data = response.json();
    console.log(data);
  };

  const changeOrder = e => {
    const order = e.target.value;
    setPartData(prevState => {
      return { ...prevState, order: order };
    });
  };

  const setMeasureMode = () => {
    let newMode = false;
    if (partData.measureMode === false) {
      setTheta(null);
      newMode = true;
      console.log("measuring...choose two points");
    } else {
      setTheta(null);
      console.log("measuring off...");
    }
    setPartData(prevState => {
      return { ...prevState, measureMode: newMode };
    });
  };

  const setTheta = theta => {
    setPartData(prevState => {
      return { ...prevState, theta: theta };
    });
  };

  const summitStringParse = summit => {
    if (summit === "Summit_1") {
      return "Summit 1";
    } else if (summit === "Summit_2") {
      return "Summit 2";
    } else if (summit === "Summit_3") {
      return "Summit 3";
    }
  };

  return (
    <div className="PartDisplay">
      {partData ? (
        <div>
          <div
            id="part-title"
            className="jumbotron jumbotron-fluid part-jumbotron"
          >
            <div className="part-info">
              {/* <button
                className="btn btn-outline-success"
                onClick={importTest.bind(null, partData.part)}
              >
                import test
              </button> */}
              <p className="display-4 lead">
                {partData.part.tracking}
                <span style={{ color: "rgb(39, 97, 204)" }}>
                  &nbsp;| &nbsp;
                </span>
              </p>
              <p className="display-4 lead">
                {partData.part.parttype}
                <span style={{ color: "rgb(39, 97, 204)" }}>
                  &nbsp;| &nbsp;
                </span>
              </p>
              <p className="display-4 lead">{partData.part.machine} </p>
              <p className="display-4 lead">
                <span style={{ color: "rgb(39, 97, 204)" }}>
                  &nbsp;| &nbsp;
                </span>
                {summitStringParse(partData.part.summit)}
              </p>
            </div>
          </div>
          <div className="part-stats"></div>
          <div className="part-graphs">
            <div
              id="carouselExampleIndicators"
              className="carousel slide"
              data-bs-ride="false"
              data-bs-interval="false"
            >
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <div className="linegraph-and-buttons">
                    <div className="linegraph-params">
                      <select
                        id="form-select"
                        className="form-select form-select mb-3"
                        aria-label=".form-select example"
                        onChange={changeMetric}
                        value={partData.metric}
                      >
                        <option value="diameter">Diameter</option>
                        <option value="position">Position</option>
                      </select>
                      <select
                        id="form-select"
                        className="form-select form-select mb-3"
                        aria-label=".form-select example"
                        onChange={changeOrder}
                        value={partData.order}
                      >
                        <option value="insp">Inspection Order</option>
                        <option value="drill">Drill Order</option>
                      </select>
                    </div>
                    <div className="line-graph">
                      <LineGraph
                        partData={partData.part}
                        metric={partData.metric}
                        order={partData.order}
                        zoom={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="carousel-item">
                  <div className="linegraph-and-buttons">
                    <div id="angle-btn " className="angle-btn-and-points">
                      <button
                        className="btn btn-outline-primary angle-btn"
                        onClick={setMeasureMode}
                      >
                        {partData.measureMode ? (
                          <span className="btn-text">Reset</span>
                        ) : (
                          <span className="btn-text">Measure Angle</span>
                        )}
                      </button>
                      <div>
                        {partData.measureMode && !partData.theta ? (
                          <span className="lead display-6 angle-text">
                            Select two points...
                          </span>
                        ) : (
                          <span className="lead display-6 angle-text"></span>
                        )}
                      </div>
                      <div>
                        {partData.measureMode && partData.theta ? (
                          <span className="lead display-6 angle-text">
                            {partData.theta}&#176; of separation
                          </span>
                        ) : (
                          <p></p>
                        )}
                      </div>
                    </div>

                    <div className="scatter-graph">
                      <ScatterPlot
                        partData={partData.part}
                        measureMode={partData.measureMode}
                        setTheta={setTheta}
                        zoom={false}
                      />
                    </div>
                  </div>
                </div>
                <div className="carousel-item">
                  <div className="linegraph-and-buttons">
                    {partData.part ? (
                      <MetricHighlights partData={partData.part} />
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <a
              className="carousel-control carousel-control-prev"
              data-bs-target="#carouselExampleIndicators"
              role="button"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="sr-only">Previous</span>
            </a>
            <a
              className="carousel-control carousel-control-next"
              data-bs-target="#carouselExampleIndicators"
              role="button"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="sr-only">Next</span>
            </a>
          </div>
        </div>
      ) : (
        <div>
          <DragAndDrop className="drag-drop-area" onDrop={onDrop} />
        </div>
      )}
    </div>
  );
}
