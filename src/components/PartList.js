import React from 'react';
import { useState, useEffect } from 'react';

export default function PartList({ passedParts, failedParts }) {
  // Concatenate pass/fail arrays
  let allParts = passedParts.concat(failedParts);
  // Order parts by time
  allParts = allParts.sort((a, b) => b.timestamp - a.timestamp);

  useEffect(() => {
    // Create DOM elements for each part
    const partList = document.querySelector('.part-list');
    for (const part of allParts) {
      let newPart = document.createElement('p');

      // Stle part based on pass/fail
      if (passedParts.indexOf(part) !== -1) {
        newPart.setAttribute(
          'class',
          'display-6 lead listed-part listed-part-passed'
        );
        newPart.style.borderColor = 'black';
      } else {
        newPart.setAttribute(
          'class',
          'display-6 lead listed-part listed-part-failed'
        );
        newPart.style.color = 'black';
      }
      newPart.innerHTML = part.tracking;
      partList.appendChild(newPart);
    }
    return () => {
      while (partList.firstChild) {
        partList.removeChild(partList.firstChild);
      }
    };
  }, []);
  return <div className="part-list"></div>;
}
