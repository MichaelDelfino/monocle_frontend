import React from 'react';
import { useState, useEffect } from 'react';
import PieChart from './PieChart';
import PartList from './PartList';
import BarChart from './BarChart';

// Use this component as base for modularization of "get" functions

export default function Forcast() {
  const getCurrentWeekNumber = () => {
    //define a date object variable that will take the current system date
    const todaydate = new Date();

    //find the year of the current date
    let oneJan = new Date(todaydate.getFullYear(), 0, 1);

    // calculating number of days in given year before a given date
    let numberOfDays = Math.floor((todaydate - oneJan) / (24 * 60 * 60 * 1000));

    // adding 1 since to current date and returns value starting from 0
    let result = Math.ceil((todaydate.getDay() + 1 + numberOfDays) / 7);

    return result;
  };
  const getWeekStartAndEnd = week => {
    //define a date object variable that will take the current system date
    const todaydate = new Date();

    //find the year of the current date
    let oneJan = new Date(todaydate.getFullYear(), 0, 1);

    const weekEnd = Date.parse(oneJan) + 604800000 * (week - 2);

    const weekStart = weekEnd + 604800000;

    return [weekStart, weekEnd];
  };

  const currentWkNo = getCurrentWeekNumber(Date.now());
  const [weekStartDate, weekEndDate] = getWeekStartAndEnd(currentWkNo);
  const [partData, setPartData] = useState({
    weekNumber: getCurrentWeekNumber(Date.now()),
    weekStartDate: weekStartDate,
    weekEndDate: weekEndDate,
    totalParts: [],
    passedParts: [],
    failedParts: [],
  });

  useEffect(() => {
    const abortController = new AbortController();
    const currentWkNo = partData.weekNumber;
    const [weekStartDate, weekEndDate] = getWeekStartAndEnd(currentWkNo);

    // Modularize other components' fetches like so
    const getQualData = async (startDate, endDate) => {
      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?flag=stats&startDate=${startDate}&endDate=${endDate}`,
        { signal: AbortController.signal }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          segregateParts(data);
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            console.log(error);
          }
        });
    };

    const segregateParts = data => {
      const totalParts = data;
      let passedParts = [];
      let failedParts = [];

      for (const part of data) {
        if (part.fail) {
          failedParts.push(part);
        } else if (!part.fail) {
          passedParts.push(part);
        }
      }
      setPartData(prevState => {
        console.log(totalParts);
        return {
          ...prevState,
          weekStartDate: weekStartDate,
          weekEndDate: weekEndDate,
          totalParts: totalParts,
          passedParts: passedParts,
          failedParts: failedParts,
        };
      });
    };
    getQualData(weekStartDate, weekEndDate);

    return () => {
      abortController.abort();
    };
  }, [
    partData.weekStartDate,
    partData.weekEndDate,
    weekStartDate,
    weekEndDate,
    partData.weekNumber,
  ]);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  const extractAngledHoles = (parttype, data) => {
    let angledholes = [];
    let straightholes = [];
    if (parttype === '1787P-01') {
      angledholes = data.slice(0, 35);
      straightholes = data.slice(35);
    } else if (parttype === '1565P-01') {
      angledholes = data.slice(588, 1268);
      straightholes = data.slice(0, 588);
    }

    return [straightholes, angledholes];
  };

  const getCDiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data)) {
      diameterArray.push(hole.cDia);
    }
    return diameterArray;
  };

  const getCPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data)) {
      positionArray.push(hole.cXY);
    }
    return positionArray;
  };

  const getADiameters = data => {
    let diameterArray = [];
    for (const hole of Object.values(data)) {
      diameterArray.push(hole.aDia);
    }
    return diameterArray;
  };

  const getAPosition = data => {
    let positionArray = [];
    for (const hole of Object.values(data)) {
      positionArray.push(hole.aXY);
    }
    return positionArray;
  };

  const setPeriod = e => {
    const period = e.target.value;
    let timeOffset = 0;
    if (partData.period === 'Today') {
      timeOffset = 604800000;
    } else {
      timeOffset = 86400000;
    }
    setPartData(prevState => {
      return {
        ...prevState,
        endDate: Date.now() - timeOffset,
        period: period,
      };
    });
  };

  const changeWeek = operator => {
    const weekNum = partData.weekNumber;
    if (operator === '+') {
      setPartData(prevState => {
        return { ...prevState, weekNumber: weekNum + 1 };
      });
    } else if (operator === '-') {
      setPartData(prevState => {
        return { ...prevState, weekNumber: weekNum - 1 };
      });
    }
  };

  const getFormattedDateStringFromUnix = date => {
    // resulting format: 2022-05-23T16:46
    const origDate = new Date(date);
    const stringDate = origDate.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
    });
    return stringDate;
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

      {/* Conditionally render each part type's stats based on data within time period */}
      {/* Need to try to make the part types dynamic, adding a new part type will require hard coding a new section */}
      <div className="week-title">
        <div className="week-selectors">
          <div className="prev-machgroup-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-chevron-double-left prev-group-arrow"
              viewBox="0 0 15 15"
              onClick={changeWeek.bind(null, '-')}
            >
              <path
                fillRule="evenodd"
                d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
              <path
                fillRule="evenodd"
                d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
            </svg>
          </div>
          <div className="stats-time-period display-5 lead">
            Week {partData.weekNumber}
          </div>
          <div className="next-machgroup-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-chevron-double-right next-group-arrow"
              viewBox="0 0 15 15"
              onClick={changeWeek.bind(null, '+')}
            >
              <path
                fillRule="evenodd"
                d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"
              />
              <path
                fillRule="evenodd"
                d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </div>
        </div>
        <div className="start-end-date">
          <p className="lead">
            {getFormattedDateStringFromUnix(partData.weekEndDate)} |
          </p>
          <p className="lead">
            &nbsp;{getFormattedDateStringFromUnix(partData.weekStartDate)}
          </p>
        </div>
      </div>
      <BarChart
        passedParts={partData.passedParts}
        failedParts={partData.failedParts}
      />
      {partData.totalParts ? (
        <div className="stats-combo">
          <div className="stats-totals">
            <div className="totals-column">
              <p className="display-6 lead">Totals</p>
              <div>Total: {partData.totalParts.length}</div>
              <div>Passed: {partData.passedParts.length}</div>
              <div>Failed: {partData.failedParts.length}</div>
              <div>
                <PieChart
                  passedParts={partData.passedParts}
                  failedParts={partData.failedParts}
                />
              </div>
            </div>
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse369"
              role="button"
              aria-expanded="false"
              aria-controls="collapse369"
            >
              <p className="display-6 lead">369's</p>
              <div>
                Total:{' '}
                {
                  partData.totalParts.filter(
                    part => part.parttype === '369P-01'
                  ).length
                }
              </div>
              <div>
                Passed:{' '}
                {
                  partData.passedParts.filter(
                    part => part.parttype === '369P-01'
                  ).length
                }
              </div>
              <div>
                Failed:{' '}
                {
                  partData.failedParts.filter(
                    part => part.parttype === '369P-01'
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === '369P-01'
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === '369P-01'
                  )}
                />
              </div>
            </div>
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse1789"
              role="button"
              aria-expanded="false"
              aria-controls="collapse1789"
            >
              <p className="display-6 lead">1789's</p>
              <div>
                Total:{' '}
                {
                  partData.totalParts.filter(
                    part => part.parttype === '1789P-01'
                  ).length
                }
              </div>
              <div>
                Passed:{' '}
                {
                  partData.passedParts.filter(
                    part => part.parttype === '1789P-01'
                  ).length
                }
              </div>
              <div>
                Failed:{' '}
                {
                  partData.failedParts.filter(
                    part => part.parttype === '1789P-01'
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === '1789P-01'
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === '1789P-01'
                  )}
                />
              </div>
            </div>
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse2078"
              role="button"
              aria-expanded="false"
              aria-controls="collapse2078"
            >
              <p className="display-6 lead">2078's</p>
              <div>
                Total:{' '}
                {
                  partData.totalParts.filter(
                    part => part.parttype === '2078P-01'
                  ).length
                }
              </div>
              <div>
                Passed:{' '}
                {
                  partData.passedParts.filter(
                    part => part.parttype === '2078P-01'
                  ).length
                }
              </div>
              <div>
                Failed:{' '}
                {
                  partData.failedParts.filter(
                    part => part.parttype === '2078P-01'
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === '2078P-01'
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === '2078P-01'
                  )}
                />
              </div>
            </div>
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse1565"
              role="button"
              aria-expanded="false"
              aria-controls="collapse1565"
            >
              <p className="display-6 lead">1565's</p>
              <div>
                Total:{' '}
                {
                  partData.totalParts.filter(
                    part => part.parttype === '1565P-01'
                  ).length
                }
              </div>
              <div>
                Passed:{' '}
                {
                  partData.passedParts.filter(
                    part => part.parttype === '1565P-01'
                  ).length
                }
              </div>
              <div>
                Failed:{' '}
                {
                  partData.failedParts.filter(
                    part => part.parttype === '1565P-01'
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === '1565P-01'
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === '1565P-01'
                  )}
                />
              </div>
            </div>
            <div
              className="parttype-column"
              data-toggle="collapse"
              href="#collapse1787"
              role="button"
              aria-expanded="false"
              aria-controls="collapse1787"
            >
              <p className="display-6 lead">1787's</p>
              <div>
                Total:{' '}
                {
                  partData.totalParts.filter(
                    part => part.parttype === '1787P-01'
                  ).length
                }
              </div>
              <div>
                Passed:{' '}
                {
                  partData.passedParts.filter(
                    part => part.parttype === '1787P-01'
                  ).length
                }
              </div>
              <div>
                Failed:{' '}
                {
                  partData.failedParts.filter(
                    part => part.parttype === '1787P-01'
                  ).length
                }
              </div>
              <div>
                <PieChart
                  passedParts={partData.passedParts.filter(
                    part => part.parttype === '1787P-01'
                  )}
                  failedParts={partData.failedParts.filter(
                    part => part.parttype === '1787P-01'
                  )}
                />
              </div>
            </div>
          </div>
          <hr></hr>
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse369">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === '369P-01'
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === '369P-01'
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse1789">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === '1789P-01'
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === '1789P-01'
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse2078">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === '2078P-01'
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === '2078P-01'
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse1565">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === '1565P-01'
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === '1565P-01'
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
          {partData.totalParts.length ? (
            <div className="collapse" id="collapse1787">
              <PartList
                passedParts={partData.passedParts.filter(
                  part => part.parttype === '1787P-01'
                )}
                failedParts={partData.failedParts.filter(
                  part => part.parttype === '1787P-01'
                )}
              />
            </div>
          ) : (
            <div></div>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
