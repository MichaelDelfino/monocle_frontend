import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useRef } from "react";

export default function DragAndDrop({ onDrop }) {
  const drop = useRef(null);

  useEffect(() => {
    drop.current.addEventListener("dragover", handleDragOver);
    drop.current.addEventListener("drop", handleDrop);

    let dropRef = drop.current;

    return () => {
      dropRef.removeEventListener("dragover", handleDragOver);
      dropRef.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
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
        Drop a text file here!
      </div>
    </div>
  );
}

DragAndDrop.propTypes = {
  onDrop: PropTypes.func.isRequired,
};
