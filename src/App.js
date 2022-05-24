import React, { useEffect, useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { SideBar } from './components/SideBar';
import Home from './components/Home';
import PartDisplay from './components/PartDisplay';
import MachineDisplay from './components/MachineDisplay';
import OptionsDisplay from './components/OptionsDisplay';

export default function App() {
  const [pageData, setPageData] = useState();

  useEffect(() => {
    setPageData({
      section: 'home',
      tracking: '',
    });
  }, []);

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
      console.log('Searching for...', tracking);
      setPageData({
        section: 'part',
        tracking: tracking,
      });
    }
  };

  return (
    <div className="App">
      <div className="search-bar">
        <SearchBar searchHandler={searchHandler} />
      </div>
      <div className="blue-strip"></div>
      <div className="content">
        <div className="side-bar">
          <SideBar sectionHandler={updateSection} />
        </div>
        {pageData ? (
          <div className="data-display">
            <div className="home-display">
              {pageData.section === 'home' ? <Home /> : <div></div>}
            </div>
            <div className="part-display">
              {pageData.section === 'part' ? (
                <PartDisplay tracking={pageData.tracking} />
              ) : (
                <div></div>
              )}
            </div>
            <div className="mach-display">
              {pageData.section === 'mach' ? <MachineDisplay /> : <div></div>}
            </div>
            <div className="options-display">
              {pageData.section === 'options' ? (
                <OptionsDisplay />
              ) : (
                <div></div>
              )}
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
