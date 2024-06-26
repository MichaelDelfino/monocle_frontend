import {React, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

export default function DragAndDrop({ onDrop }) {
  const drop = useRef(null);

  useEffect(() => {
    drop.current.addEventListener('dragover', handleDragOver);
    drop.current.addEventListener('drop', handleDrop);

    let dropRef = drop.current;

    return () => {
      dropRef.removeEventListener('dragover', handleDragOver);
      dropRef.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();

    const { files } = e.dataTransfer;

    if (files && files.length) {
      onDrop(files);
    }
  };

  return (
    <div>
      <div ref={drop} className="drag-drop-area">
        Drop a text file here! Or search up there
      </div>
    </div>
  );
}

DragAndDrop.propTypes = {
  onDrop: PropTypes.func.isRequired,
};
