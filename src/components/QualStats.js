import React from 'react';
import { useState, useEffect } from 'react';

// Use this component as base for modularization of "get" functions

export default function QualStats() {
  const [partData, setPartData] = useState({
    startDate: Date.now(),
    endDate: Date.now() - 604800000,
  });

  useEffect(() => {
    const abortController = new AbortController();

    // Modularize other components' fetches like so
    const getWeekData = async (startDate, endDate) => {
      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?flag=stats&startDate=${startDate}&endDate=${endDate}`,
        { signal: AbortController.signal }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          console.log(data);
          calcPassFail(data).then(response => {
            console.log(response);
          });
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.log(error);
          }
        });
    };

    const calcPassFail = async data => {
      const totalParts = data.length;

      let allCDia,
        allADia,
        allCPos,
        allAPos,
        passedParts,
        failedParts = [];

      let tolerances = {};

      for (const part of data) {
        const defFile = './config/partDefinitions.json';
        const response = await fetch(defFile);
        const partDef = await response.json();

        for (const def of partDef) {
          if (String(def.partType).trim() === String(part.parttype).trim()) {
            tolerances = part.tolerances;
          }
        }
        allCDia = getCDiameters(part);
        allADia = getADiameters(part);
        allCPos = getCPosition(part);
        allAPos = getAPosition(part);

        if (
          Math.max(...allCDia) >
            tolerances['c-side']['diaNom'] + tolerances['c-side']['diaPlus'] ||
          Math.max(...allCDia) <
            tolerances['c-side']['diaNom'] - tolerances['c-side']['diaMin']
        ) {
          failedParts.push(part);
        } else {
          passedParts.push(part);
        }
      }
      console.log(totalParts, passedParts.length, failedParts.length);
    };

    getWeekData(partData.startDate, partData.endDate);

    return () => {
      abortController.abort();
    };
  }, [partData.startDate, partData.endDate]);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  const getCDiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data.csidedata)) {
      diameterArray.push(hole.cDia);
    }
    return diameterArray;
  };

  const getCPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data.csidedata)) {
      positionArray.push(hole.cXY);
    }
    return positionArray;
  };

  const getADiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data.asidedata)) {
      diameterArray.push(hole.aDia);
    }
    return diameterArray;
  };

  const getAPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data.asidedata)) {
      positionArray.push(hole.aXY);
    }
    return positionArray;
  };

  return (
    <div className="Stats-Display">
      <div id="stats-title" className="jumbotron stats-jumbotron">
        <div className="stats-info">
          <p className="display-4 lead">
            Quality Statistics
            <span style={{ color: 'rgb(39, 97, 204)' }}></span>
          </p>
        </div>
      </div>
    </div>
  );
}
