import React from "react";

export default function GraphGuide() {
  return (
    <div>
      <div className="graph-guide-anomaly">
        <div className="graph-guide-image">
          <img src="./img/air_pocket.png" height="250" width="450" />
        </div>
        <div className="graph-guide-desc">
          <h5>Configuration</h5>
          <p>Position | Inspection Order</p>
          <h5>Description</h5>
          <p>
            Part was not level on the Summit. Small air pockets between the
            mylar and the part could raise the part just enought to cause this
            pattern.
          </p>
          <p>
            Notice how the wave pattern only appears on the a-side (grey) of the
            part. This is an indication that the air pocket emerged when the
            part was flipped.
          </p>
          <h5>Action</h5>
          <p>
            Re-inspect the part, ensuring the part is flat as flat as possible
            by applying a bit of pressure to its surface.
          </p>
        </div>
      </div>
      <hr></hr>
      <div className="graph-guide-anomaly">
        <div className="graph-guide-image">
          <img src="./img/wrong_electrode.png" height="250" width="450" />
        </div>
        <div className="graph-guide-desc">
          <h5>Configuration</h5>
          <p>Diameter | Drill Order</p>
          <h5>Description</h5>
          <p>
            An electrode of the wrong size loaded into the tool during an
            electrode change can cause this pattern.
          </p>
          <p>
            A single electrode drills approximately 100 holes, so when you see
            an anomaly that only affects roughly 100 holes in the middle of a
            part, this is likely the case.
          </p>
          <h5>Action</h5>
          <p>None</p>
        </div>
      </div>
      <hr></hr>
      <div className="graph-guide-anomaly">
        <div className="graph-guide-image">
          <img src="./img/operator_oops.png" height="250" width="450" />
          <img src="./img/operator_oops2.png" height="250" width="450" />
        </div>
        <div className="graph-guide-desc">
          <h5>Configuration</h5>
          <p>Diameter/Position | Drill Order</p>
          <h5>Description</h5>
          <p>
            Part wasn't clamped down properly, then during an electrode change,
            the operator noticed the error and re-clamped the part, causing the
            data to level out.
          </p>
          <p>
            Notice the the issues are present when viewing both diameter and
            position graphs. Oftentimes if an issue is present on both diameter
            and position on the same holes, it is likely a fixturing problem.
          </p>
          <h5>Action</h5>
          <p>None</p>
        </div>
      </div>
    </div>
  );
}
