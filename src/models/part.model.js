export default class Part {
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