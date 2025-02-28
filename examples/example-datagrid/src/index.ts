// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import {
  BasicKeyHandler,
  BasicMouseHandler,
  BasicSelectionModel,
  CellEditor,
  CellGroup,
  CellRenderer,
  DataGrid,
  DataModel,
  HyperlinkRenderer,
  ICellEditor,
  JSONModel,
  MutableDataModel,
  TextRenderer
} from '@lumino/datagrid';

import { DockPanel, StackedPanel, Widget } from '@lumino/widgets';

import { getKeyboardLayout } from '@lumino/keyboard';

import '../style/index.css';

class MergedCellModel extends DataModel {
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 20 : 3;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 6 : 3;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return `R: ${row}, ${column}`;
    }
    if (region === 'column-header') {
      return `C: ${row}, ${column}`;
    }
    if (region === 'corner-header') {
      return `N: ${row}, ${column}`;
    }
    return `(${row}, ${column})`;
  }

  groupCount(region: DataModel.RowRegion): number {
    if (region === 'body') {
      return 3;
    } else if (region === 'column-header') {
      return 1;
    } else if (region === 'row-header') {
      return 2;
    } else if (region === 'corner-header') {
      return 1;
    }
    return 0;
  }

  group(region: DataModel.CellRegion, groupIndex: number): CellGroup | null {
    if (region === 'body') {
      return [
        { r1: 1, c1: 1, r2: 2, c2: 2 },
        { r1: 5, c1: 1, r2: 5, c2: 2 },
        { r1: 3, c1: 5, r2: 4, c2: 5 }
      ][groupIndex];
    }

    if (region === 'column-header') {
      return [{ r1: 0, c1: 4, r2: 1, c2: 4 }][groupIndex];
    }

    if (region === 'row-header') {
      return [
        { r1: 0, c1: 0, r2: 1, c2: 1 },
        { r1: 4, c1: 0, r2: 5, c2: 0 }
      ][groupIndex];
    }

    if (region === 'corner-header') {
      return [{ r1: 0, c1: 0, r2: 1, c2: 1 }][groupIndex];
    }

    return null;
  }
}

class LargeDataModel extends DataModel {
  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? 1000000000000 : 2;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 1000000000000 : 3;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return `R: ${row}, ${column}`;
    }
    if (region === 'column-header') {
      return `C: ${row}, ${column}`;
    }
    if (region === 'corner-header') {
      return `N: ${row}, ${column}`;
    }
    return `(${row}, ${column})`;
  }
}

class StreamingDataModel extends DataModel {
  static createRow(n: number): number[] {
    let row = new Array(n);
    for (let i = 0; i < n; ++i) {
      row[i] = Math.random();
    }
    return row;
  }

  constructor() {
    super();
    setInterval(this._tick, 250);
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._data.length : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? 50 : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return `R: ${row}, ${column}`;
    }
    if (region === 'column-header') {
      return `C: ${row}, ${column}`;
    }
    if (region === 'corner-header') {
      return `N: ${row}, ${column}`;
    }
    return this._data[row][column];
  }

  private _tick = () => {
    let nr = this.rowCount('body');
    let nc = this.columnCount('body');
    let r1 = Math.random();
    let r2 = Math.random();
    let i = Math.floor(r2 * nr);
    if ((r1 < 0.45 && nr > 4) || nr >= 500) {
      this._data.splice(i, 1);
      this.emitChanged({
        type: 'rows-removed',
        region: 'body',
        index: i,
        span: 1
      });
    } else {
      this._data.splice(i, 0, StreamingDataModel.createRow(nc));
      this.emitChanged({
        type: 'rows-inserted',
        region: 'body',
        index: i,
        span: 1
      });
    }
  };

  private _data: number[][] = [];
}

class RandomDataModel extends DataModel {
  static genPoint(): number {
    return Math.random() * 10 - 2;
  }

  constructor(rowCount: number, columnCount: number) {
    super();
    let nr = (this._rowCount = rowCount);
    let nc = (this._columnCount = columnCount);
    for (let i = 0, n = nr * nc; i < n; ++i) {
      this._data[i] = i / n;
    }
    setInterval(this._tick, 60);
  }

  rowCount(region: DataModel.RowRegion): number {
    return region === 'body' ? this._rowCount : 1;
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return region === 'body' ? this._columnCount : 1;
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    if (region === 'row-header') {
      return `R: ${row}, ${column}`;
    }
    if (region === 'column-header') {
      return `C: ${row}, ${column}`;
    }
    if (region === 'corner-header') {
      return `N: ${row}, ${column}`;
    }
    return this._data[row * this._columnCount + column];
  }

  private _tick = () => {
    let nr = this._rowCount;
    let nc = this._columnCount;
    let i = Math.floor(Math.random() * (nr * nc - 1));
    let r = Math.floor(i / nc);
    let c = i - r * nc;
    this._data[i] = (this._data[i] + Math.random()) % 1;
    this.emitChanged({
      type: 'cells-changed',
      region: 'body',
      row: r,
      column: c,
      rowSpan: 1,
      columnSpan: 1
    });
  };

  private _rowCount: number;
  private _columnCount: number;
  private _data: number[] = [];
}

/**
 * Example custom cell editor which implements editing
 * JSON cell data.
 */
class JSONCellEditor extends CellEditor {
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    super.dispose();

    document.body.removeChild(this._textarea);
  }

  protected startEditing() {
    this._createWidgets();
  }

  protected getInput(): any {
    return JSON.parse(this._textarea.value);
  }

  protected validate() {
    let value;
    try {
      value = this.getInput();
    } catch (error) {
      console.log(`Input error: ${error.message}`);
      this.setValidity(false);
      return;
    }

    if (this.validator) {
      const result = this.validator.validate(this.cell, value);
      if (result.valid) {
        this.setValidity(true);
      } else {
        this.setValidity(false, result.message || 'Invalid JSON input');
      }
    } else {
      this.setValidity(true);
    }
  }

  private _createWidgets() {
    const cell = this.cell;
    const grid = this.cell.grid;
    if (!grid.dataModel) {
      this.cancel();
      return;
    }

    let data = grid.dataModel.data('body', cell.row, cell.column);

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('cell-editor');
    button.style.width = '100%';
    button.style.height = '100%';
    button.style.whiteSpace = 'nowrap';
    button.style.overflow = 'hidden';
    button.style.textOverflow = 'ellipsis';

    button.textContent = this._deserialize(data);
    this.editorContainer.appendChild(button);

    this._button = button;

    const width = 200;
    const height = 50;
    const textarea = document.createElement('textarea');
    textarea.style.pointerEvents = 'auto';
    textarea.style.position = 'absolute';
    textarea.style.outline = 'none';
    const buttonRect = this._button.getBoundingClientRect();
    const top = buttonRect.bottom + 2;
    const left = buttonRect.left;

    textarea.style.top = top + 'px';
    textarea.style.left = left + 'px';
    textarea.style.width = width + 'px';
    textarea.style.height = height + 'px';

    textarea.value = JSON.stringify(data);

    textarea.addEventListener('keydown', (event: KeyboardEvent) => {
      const key = getKeyboardLayout().keyForKeydownEvent(event);
      if (key === 'Enter' || key === 'Tab') {
        const next =
          key === 'Enter'
            ? event.shiftKey
              ? 'up'
              : 'down'
            : event.shiftKey
            ? 'left'
            : 'right';
        if (!this.commit(next)) {
          this.setValidity(false);
        }
        event.preventDefault();
        event.stopPropagation();
      } else if (key === 'Escape') {
        this.cancel();
      }
    });

    textarea.addEventListener('blur', (event: FocusEvent) => {
      if (this.isDisposed) {
        return;
      }

      if (!this.commit()) {
        this.setValidity(false);
      }
    });

    textarea.addEventListener('input', (event: Event) => {
      this.inputChanged.emit(void 0);
    });

    this._textarea = textarea;

    document.body.appendChild(this._textarea);
    this._textarea.focus();
  }

  private _deserialize(value: any): any {
    return JSON.stringify(value);
  }

  private _button: HTMLButtonElement;
  private _textarea: HTMLTextAreaElement;
}

/**
 * Mutable JSON data model. Allows editing existing
 * grid cell values via MutableDataModel interface.
 */
class MutableJSONModel extends MutableDataModel {
  constructor(options: JSONModel.IOptions) {
    super();

    this._jsonModel = new JSONModel(options);
  }

  rowCount(region: DataModel.RowRegion): number {
    return this._jsonModel.rowCount(region);
  }

  columnCount(region: DataModel.ColumnRegion): number {
    return this._jsonModel.columnCount(region);
  }

  metadata(
    region: DataModel.CellRegion,
    row: number,
    column: number
  ): DataModel.Metadata {
    return this._jsonModel.metadata(region, row, column);
  }

  data(region: DataModel.CellRegion, row: number, column: number): any {
    return this._jsonModel.data(region, row, column);
  }

  setData(
    region: DataModel.CellRegion,
    row: number,
    column: number,
    value: any
  ): boolean {
    const model = this._jsonModel as any;

    // Set up the field and value variables.
    let field: JSONModel.Field;

    // Look up the field and value for the region.
    switch (region) {
      case 'body':
        field = model._bodyFields[column];
        model._data[row][field.name] = value;
        break;
      default:
        throw 'cannot change header data';
    }

    this.emitChanged({
      type: 'cells-changed',
      region: 'body',
      row: row,
      column: column,
      rowSpan: 1,
      columnSpan: 1
    });

    return true;
  }

  private _jsonModel: JSONModel;
}

const redGreenBlack: CellRenderer.ConfigFunc<string> = ({ value }) => {
  if (value <= 1 / 3) {
    return '#000000';
  }
  if (value <= 2 / 3) {
    return '#FF0000';
  }
  return '#009B00';
};

const heatMapViridis: CellRenderer.ConfigFunc<string> = ({ value }) => {
  let r = Math.floor(ViridisCM.red(value) * 255);
  let g = Math.floor(ViridisCM.green(value) * 255);
  let b = Math.floor(ViridisCM.blue(value) * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

const heatMapViridisInverse: CellRenderer.ConfigFunc<string> = ({ value }) => {
  let r = Math.floor(255 - ViridisCM.red(value) * 255);
  let g = Math.floor(255 - ViridisCM.green(value) * 255);
  let b = Math.floor(255 - ViridisCM.blue(value) * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

function createWrapper(content: Widget, title: string): Widget {
  let wrapper = new StackedPanel();
  wrapper.addClass('content-wrapper');
  wrapper.addWidget(content);
  wrapper.title.label = title;
  return wrapper;
}

function main(): void {
  let model1 = new LargeDataModel();
  let model2 = new StreamingDataModel();
  let model3 = new RandomDataModel(15, 10);
  let model4 = new RandomDataModel(80, 80);
  let model5 = new JSONModel(Data.cars);
  let model6 = new MutableJSONModel(Data.editable_test_data);
  let model7 = new MergedCellModel();

  let blueStripeStyle: DataGrid.Style = {
    ...DataGrid.defaultStyle,
    rowBackgroundColor: i => (i % 2 === 0 ? 'rgba(138, 172, 200, 0.3)' : ''),
    columnBackgroundColor: i => (i % 2 === 0 ? 'rgba(100, 100, 100, 0.1)' : '')
  };

  let brownStripeStyle: DataGrid.Style = {
    ...DataGrid.defaultStyle,
    columnBackgroundColor: i => (i % 2 === 0 ? 'rgba(165, 143, 53, 0.2)' : '')
  };

  let greenStripeStyle: DataGrid.Style = {
    ...DataGrid.defaultStyle,
    rowBackgroundColor: i => (i % 2 === 0 ? 'rgba(64, 115, 53, 0.2)' : '')
  };

  let lightSelectionStyle: DataGrid.Style = {
    ...DataGrid.defaultStyle,
    selectionFillColor: 'rgba(255, 255, 255, 0.2)',
    selectionBorderColor: 'white',
    headerSelectionBorderColor: 'white',
    cursorBorderColor: 'white'
  };

  let fgColorFloatRenderer = new TextRenderer({
    font: 'bold 12px sans-serif',
    textColor: redGreenBlack,
    format: TextRenderer.formatFixed({ digits: 2 }),
    horizontalAlignment: 'right'
  });

  let bgColorFloatRenderer = new TextRenderer({
    textColor: heatMapViridisInverse,
    backgroundColor: heatMapViridis,
    format: TextRenderer.formatFixed({ digits: 2 }),
    horizontalAlignment: 'right'
  });

  let elideFloatRenderer = new TextRenderer({
    elideDirection: ({ column }) => (column % 2 === 0 ? 'right' : 'left')
  });

  let grid1 = new DataGrid({ style: blueStripeStyle });
  grid1.dataModel = model1;
  grid1.keyHandler = new BasicKeyHandler();
  grid1.mouseHandler = new BasicMouseHandler();
  grid1.selectionModel = new BasicSelectionModel({ dataModel: model1 });

  let grid2 = new DataGrid({ style: brownStripeStyle });
  grid2.cellRenderers.update({ body: elideFloatRenderer });
  grid2.dataModel = model2;
  grid2.keyHandler = new BasicKeyHandler();
  grid2.mouseHandler = new BasicMouseHandler();
  grid2.selectionModel = new BasicSelectionModel({
    dataModel: model2,
    selectionMode: 'column'
  });

  let grid3 = new DataGrid({
    stretchLastColumn: true,
    minimumSizes: {
      rowHeight: 25,
      columnWidth: 70,
      rowHeaderWidth: 70,
      columnHeaderHeight: 25
    }
  });
  grid3.cellRenderers.update({ body: fgColorFloatRenderer });
  grid3.dataModel = model3;
  grid3.keyHandler = new BasicKeyHandler();
  grid3.mouseHandler = new BasicMouseHandler();
  grid3.selectionModel = new BasicSelectionModel({ dataModel: model3 });

  let grid4 = new DataGrid({ style: lightSelectionStyle });
  grid4.cellRenderers.update({ body: bgColorFloatRenderer });
  grid4.dataModel = model4;
  grid4.keyHandler = new BasicKeyHandler();
  grid4.mouseHandler = new BasicMouseHandler();
  grid4.selectionModel = new BasicSelectionModel({ dataModel: model4 });

  let grid5 = new DataGrid({
    style: greenStripeStyle,
    defaultSizes: {
      rowHeight: 32,
      columnWidth: 128,
      rowHeaderWidth: 64,
      columnHeaderHeight: 32
    }
  });
  grid5.dataModel = model5;
  grid5.keyHandler = new BasicKeyHandler();
  grid5.mouseHandler = new BasicMouseHandler();
  grid5.selectionModel = new BasicSelectionModel({
    dataModel: model5,
    selectionMode: 'row'
  });

  let grid6 = new DataGrid({
    defaultSizes: {
      rowHeight: 32,
      columnWidth: 90,
      rowHeaderWidth: 64,
      columnHeaderHeight: 32
    }
  });
  grid6.dataModel = model6;
  grid6.keyHandler = new BasicKeyHandler();
  grid6.mouseHandler = new BasicMouseHandler();
  grid6.selectionModel = new BasicSelectionModel({
    dataModel: model6,
    selectionMode: 'cell'
  });
  grid6.editingEnabled = true;
  const columnIdentifier = { name: 'Corp. Data' };
  grid6.editorController!.setEditor(
    columnIdentifier,
    (config: CellEditor.CellConfig): ICellEditor => {
      return new JSONCellEditor();
    }
  );

  const hyperlinkRenderer = new HyperlinkRenderer({
    url: (config: CellRenderer.CellConfig) => {
      return config.value[0];
    },
    urlName: (config: CellRenderer.CellConfig) => {
      return config.value[1];
    }
  });

  grid6.cellRenderers.update({
    body: (config: CellRenderer.CellConfig) => {
      if (config.metadata.name === 'link') {
        return hyperlinkRenderer;
      }
      return undefined;
    }
  });

  let grid7 = new DataGrid();
  grid7.dataModel = model6;

  let grid8 = new DataGrid();
  grid8.dataModel = model7;
  grid8.keyHandler = new BasicKeyHandler();
  grid8.mouseHandler = new BasicMouseHandler();
  grid8.selectionModel = new BasicSelectionModel({
    dataModel: model7,
    selectionMode: 'cell'
  });

  let wrapper1 = createWrapper(grid1, 'Trillion Rows/Cols');
  let wrapper2 = createWrapper(grid2, 'Streaming Rows');
  let wrapper3 = createWrapper(grid3, 'Random Ticks 1');
  let wrapper4 = createWrapper(grid4, 'Random Ticks 2');
  let wrapper5 = createWrapper(grid5, 'JSON Data');
  let wrapper6 = createWrapper(grid6, 'Editable Grid');
  let wrapper7 = createWrapper(grid7, 'Copy');
  let wrapper8 = createWrapper(grid8, 'Merged Cells');

  let dock = new DockPanel();
  dock.id = 'dock';

  dock.addWidget(wrapper1);
  dock.addWidget(wrapper2, { mode: 'split-right', ref: wrapper1 });
  dock.addWidget(wrapper3, { mode: 'split-bottom', ref: wrapper1 });
  dock.addWidget(wrapper4, { mode: 'split-bottom', ref: wrapper2 });
  dock.addWidget(wrapper5, { mode: 'split-bottom', ref: wrapper2 });
  dock.addWidget(wrapper6, { mode: 'tab-before', ref: wrapper1 });
  dock.addWidget(wrapper7, { mode: 'split-bottom', ref: wrapper6 });
  dock.addWidget(wrapper8, { mode: 'tab-after', ref: wrapper1 });
  dock.activateWidget(wrapper6);

  window.onresize = () => {
    dock.update();
  };

  Widget.attach(dock, document.body);
}

window.onload = main;

namespace ViridisCM {
  // Color table from:
  // https://github.com/matplotlib/matplotlib/blob/38be7aeaaac3691560aeadafe46722dda427ef47/lib/matplotlib/_cm_listed.py
  const colorTable = [
    [0.267004, 0.004874, 0.329415],
    [0.26851, 0.009605, 0.335427],
    [0.269944, 0.014625, 0.341379],
    [0.271305, 0.019942, 0.347269],
    [0.272594, 0.025563, 0.353093],
    [0.273809, 0.031497, 0.358853],
    [0.274952, 0.037752, 0.364543],
    [0.276022, 0.044167, 0.370164],
    [0.277018, 0.050344, 0.375715],
    [0.277941, 0.056324, 0.381191],
    [0.278791, 0.062145, 0.386592],
    [0.279566, 0.067836, 0.391917],
    [0.280267, 0.073417, 0.397163],
    [0.280894, 0.078907, 0.402329],
    [0.281446, 0.08432, 0.407414],
    [0.281924, 0.089666, 0.412415],
    [0.282327, 0.094955, 0.417331],
    [0.282656, 0.100196, 0.42216],
    [0.28291, 0.105393, 0.426902],
    [0.283091, 0.110553, 0.431554],
    [0.283197, 0.11568, 0.436115],
    [0.283229, 0.120777, 0.440584],
    [0.283187, 0.125848, 0.44496],
    [0.283072, 0.130895, 0.449241],
    [0.282884, 0.13592, 0.453427],
    [0.282623, 0.140926, 0.457517],
    [0.28229, 0.145912, 0.46151],
    [0.281887, 0.150881, 0.465405],
    [0.281412, 0.155834, 0.469201],
    [0.280868, 0.160771, 0.472899],
    [0.280255, 0.165693, 0.476498],
    [0.279574, 0.170599, 0.479997],
    [0.278826, 0.17549, 0.483397],
    [0.278012, 0.180367, 0.486697],
    [0.277134, 0.185228, 0.489898],
    [0.276194, 0.190074, 0.493001],
    [0.275191, 0.194905, 0.496005],
    [0.274128, 0.199721, 0.498911],
    [0.273006, 0.20452, 0.501721],
    [0.271828, 0.209303, 0.504434],
    [0.270595, 0.214069, 0.507052],
    [0.269308, 0.218818, 0.509577],
    [0.267968, 0.223549, 0.512008],
    [0.26658, 0.228262, 0.514349],
    [0.265145, 0.232956, 0.516599],
    [0.263663, 0.237631, 0.518762],
    [0.262138, 0.242286, 0.520837],
    [0.260571, 0.246922, 0.522828],
    [0.258965, 0.251537, 0.524736],
    [0.257322, 0.25613, 0.526563],
    [0.255645, 0.260703, 0.528312],
    [0.253935, 0.265254, 0.529983],
    [0.252194, 0.269783, 0.531579],
    [0.250425, 0.27429, 0.533103],
    [0.248629, 0.278775, 0.534556],
    [0.246811, 0.283237, 0.535941],
    [0.244972, 0.287675, 0.53726],
    [0.243113, 0.292092, 0.538516],
    [0.241237, 0.296485, 0.539709],
    [0.239346, 0.300855, 0.540844],
    [0.237441, 0.305202, 0.541921],
    [0.235526, 0.309527, 0.542944],
    [0.233603, 0.313828, 0.543914],
    [0.231674, 0.318106, 0.544834],
    [0.229739, 0.322361, 0.545706],
    [0.227802, 0.326594, 0.546532],
    [0.225863, 0.330805, 0.547314],
    [0.223925, 0.334994, 0.548053],
    [0.221989, 0.339161, 0.548752],
    [0.220057, 0.343307, 0.549413],
    [0.21813, 0.347432, 0.550038],
    [0.21621, 0.351535, 0.550627],
    [0.214298, 0.355619, 0.551184],
    [0.212395, 0.359683, 0.55171],
    [0.210503, 0.363727, 0.552206],
    [0.208623, 0.367752, 0.552675],
    [0.206756, 0.371758, 0.553117],
    [0.204903, 0.375746, 0.553533],
    [0.203063, 0.379716, 0.553925],
    [0.201239, 0.38367, 0.554294],
    [0.19943, 0.387607, 0.554642],
    [0.197636, 0.391528, 0.554969],
    [0.19586, 0.395433, 0.555276],
    [0.1941, 0.399323, 0.555565],
    [0.192357, 0.403199, 0.555836],
    [0.190631, 0.407061, 0.556089],
    [0.188923, 0.41091, 0.556326],
    [0.187231, 0.414746, 0.556547],
    [0.185556, 0.41857, 0.556753],
    [0.183898, 0.422383, 0.556944],
    [0.182256, 0.426184, 0.55712],
    [0.180629, 0.429975, 0.557282],
    [0.179019, 0.433756, 0.55743],
    [0.177423, 0.437527, 0.557565],
    [0.175841, 0.44129, 0.557685],
    [0.174274, 0.445044, 0.557792],
    [0.172719, 0.448791, 0.557885],
    [0.171176, 0.45253, 0.557965],
    [0.169646, 0.456262, 0.55803],
    [0.168126, 0.459988, 0.558082],
    [0.166617, 0.463708, 0.558119],
    [0.165117, 0.467423, 0.558141],
    [0.163625, 0.471133, 0.558148],
    [0.162142, 0.474838, 0.55814],
    [0.160665, 0.47854, 0.558115],
    [0.159194, 0.482237, 0.558073],
    [0.157729, 0.485932, 0.558013],
    [0.15627, 0.489624, 0.557936],
    [0.154815, 0.493313, 0.55784],
    [0.153364, 0.497, 0.557724],
    [0.151918, 0.500685, 0.557587],
    [0.150476, 0.504369, 0.55743],
    [0.149039, 0.508051, 0.55725],
    [0.147607, 0.511733, 0.557049],
    [0.14618, 0.515413, 0.556823],
    [0.144759, 0.519093, 0.556572],
    [0.143343, 0.522773, 0.556295],
    [0.141935, 0.526453, 0.555991],
    [0.140536, 0.530132, 0.555659],
    [0.139147, 0.533812, 0.555298],
    [0.13777, 0.537492, 0.554906],
    [0.136408, 0.541173, 0.554483],
    [0.135066, 0.544853, 0.554029],
    [0.133743, 0.548535, 0.553541],
    [0.132444, 0.552216, 0.553018],
    [0.131172, 0.555899, 0.552459],
    [0.129933, 0.559582, 0.551864],
    [0.128729, 0.563265, 0.551229],
    [0.127568, 0.566949, 0.550556],
    [0.126453, 0.570633, 0.549841],
    [0.125394, 0.574318, 0.549086],
    [0.124395, 0.578002, 0.548287],
    [0.123463, 0.581687, 0.547445],
    [0.122606, 0.585371, 0.546557],
    [0.121831, 0.589055, 0.545623],
    [0.121148, 0.592739, 0.544641],
    [0.120565, 0.596422, 0.543611],
    [0.120092, 0.600104, 0.54253],
    [0.119738, 0.603785, 0.5414],
    [0.119512, 0.607464, 0.540218],
    [0.119423, 0.611141, 0.538982],
    [0.119483, 0.614817, 0.537692],
    [0.119699, 0.61849, 0.536347],
    [0.120081, 0.622161, 0.534946],
    [0.120638, 0.625828, 0.533488],
    [0.12138, 0.629492, 0.531973],
    [0.122312, 0.633153, 0.530398],
    [0.123444, 0.636809, 0.528763],
    [0.12478, 0.640461, 0.527068],
    [0.126326, 0.644107, 0.525311],
    [0.128087, 0.647749, 0.523491],
    [0.130067, 0.651384, 0.521608],
    [0.132268, 0.655014, 0.519661],
    [0.134692, 0.658636, 0.517649],
    [0.137339, 0.662252, 0.515571],
    [0.14021, 0.665859, 0.513427],
    [0.143303, 0.669459, 0.511215],
    [0.146616, 0.67305, 0.508936],
    [0.150148, 0.676631, 0.506589],
    [0.153894, 0.680203, 0.504172],
    [0.157851, 0.683765, 0.501686],
    [0.162016, 0.687316, 0.499129],
    [0.166383, 0.690856, 0.496502],
    [0.170948, 0.694384, 0.493803],
    [0.175707, 0.6979, 0.491033],
    [0.180653, 0.701402, 0.488189],
    [0.185783, 0.704891, 0.485273],
    [0.19109, 0.708366, 0.482284],
    [0.196571, 0.711827, 0.479221],
    [0.202219, 0.715272, 0.476084],
    [0.20803, 0.718701, 0.472873],
    [0.214, 0.722114, 0.469588],
    [0.220124, 0.725509, 0.466226],
    [0.226397, 0.728888, 0.462789],
    [0.232815, 0.732247, 0.459277],
    [0.239374, 0.735588, 0.455688],
    [0.24607, 0.73891, 0.452024],
    [0.252899, 0.742211, 0.448284],
    [0.259857, 0.745492, 0.444467],
    [0.266941, 0.748751, 0.440573],
    [0.274149, 0.751988, 0.436601],
    [0.281477, 0.755203, 0.432552],
    [0.288921, 0.758394, 0.428426],
    [0.296479, 0.761561, 0.424223],
    [0.304148, 0.764704, 0.419943],
    [0.311925, 0.767822, 0.415586],
    [0.319809, 0.770914, 0.411152],
    [0.327796, 0.77398, 0.40664],
    [0.335885, 0.777018, 0.402049],
    [0.344074, 0.780029, 0.397381],
    [0.35236, 0.783011, 0.392636],
    [0.360741, 0.785964, 0.387814],
    [0.369214, 0.788888, 0.382914],
    [0.377779, 0.791781, 0.377939],
    [0.386433, 0.794644, 0.372886],
    [0.395174, 0.797475, 0.367757],
    [0.404001, 0.800275, 0.362552],
    [0.412913, 0.803041, 0.357269],
    [0.421908, 0.805774, 0.35191],
    [0.430983, 0.808473, 0.346476],
    [0.440137, 0.811138, 0.340967],
    [0.449368, 0.813768, 0.335384],
    [0.458674, 0.816363, 0.329727],
    [0.468053, 0.818921, 0.323998],
    [0.477504, 0.821444, 0.318195],
    [0.487026, 0.823929, 0.312321],
    [0.496615, 0.826376, 0.306377],
    [0.506271, 0.828786, 0.300362],
    [0.515992, 0.831158, 0.294279],
    [0.525776, 0.833491, 0.288127],
    [0.535621, 0.835785, 0.281908],
    [0.545524, 0.838039, 0.275626],
    [0.555484, 0.840254, 0.269281],
    [0.565498, 0.84243, 0.262877],
    [0.575563, 0.844566, 0.256415],
    [0.585678, 0.846661, 0.249897],
    [0.595839, 0.848717, 0.243329],
    [0.606045, 0.850733, 0.236712],
    [0.616293, 0.852709, 0.230052],
    [0.626579, 0.854645, 0.223353],
    [0.636902, 0.856542, 0.21662],
    [0.647257, 0.8584, 0.209861],
    [0.657642, 0.860219, 0.203082],
    [0.668054, 0.861999, 0.196293],
    [0.678489, 0.863742, 0.189503],
    [0.688944, 0.865448, 0.182725],
    [0.699415, 0.867117, 0.175971],
    [0.709898, 0.868751, 0.169257],
    [0.720391, 0.87035, 0.162603],
    [0.730889, 0.871916, 0.156029],
    [0.741388, 0.873449, 0.149561],
    [0.751884, 0.874951, 0.143228],
    [0.762373, 0.876424, 0.137064],
    [0.772852, 0.877868, 0.131109],
    [0.783315, 0.879285, 0.125405],
    [0.79376, 0.880678, 0.120005],
    [0.804182, 0.882046, 0.114965],
    [0.814576, 0.883393, 0.110347],
    [0.82494, 0.88472, 0.106217],
    [0.83527, 0.886029, 0.102646],
    [0.845561, 0.887322, 0.099702],
    [0.85581, 0.888601, 0.097452],
    [0.866013, 0.889868, 0.095953],
    [0.876168, 0.891125, 0.09525],
    [0.886271, 0.892374, 0.095374],
    [0.89632, 0.893616, 0.096335],
    [0.906311, 0.894855, 0.098125],
    [0.916242, 0.896091, 0.100717],
    [0.926106, 0.89733, 0.104071],
    [0.935904, 0.89857, 0.108131],
    [0.945636, 0.899815, 0.112838],
    [0.9553, 0.901065, 0.118128],
    [0.964894, 0.902323, 0.123941],
    [0.974417, 0.90359, 0.130215],
    [0.983868, 0.904867, 0.136897],
    [0.993248, 0.906157, 0.143936]
  ];

  export function red(value: number): number {
    return colorTable[getIndex(value)][0];
  }

  export function green(value: number): number {
    return colorTable[getIndex(value)][1];
  }

  export function blue(value: number): number {
    return colorTable[getIndex(value)][2];
  }

  function getIndex(value: number): number {
    return Math.round(value * (colorTable.length - 1));
  }
}

namespace Data {
  export const cars = {
    data: [
      {
        Horsepower: 130.0,
        Origin: 'USA',
        Miles_per_Gallon: 18.0,
        Name: 'chevrolet chevelle malibu',
        index: 0,
        Acceleration: 12.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3504,
        Cylinders: 8,
        Displacement: 307.0
      },
      {
        Horsepower: 165.0,
        Origin: 'USA',
        Miles_per_Gallon: 15.0,
        Name: 'buick skylark 320',
        index: 1,
        Acceleration: 11.5,
        Year: '1970-01-01',
        Weight_in_lbs: 3693,
        Cylinders: 8,
        Displacement: 350.0
      },
      {
        Horsepower: 150.0,
        Origin: 'USA',
        Miles_per_Gallon: 18.0,
        Name: 'plymouth satellite',
        index: 2,
        Acceleration: 11.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3436,
        Cylinders: 8,
        Displacement: 318.0
      },
      {
        Horsepower: 150.0,
        Origin: 'USA',
        Miles_per_Gallon: 16.0,
        Name: 'amc rebel sst',
        index: 3,
        Acceleration: 12.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3433,
        Cylinders: 8,
        Displacement: 304.0
      },
      {
        Horsepower: 140.0,
        Origin: 'USA',
        Miles_per_Gallon: 17.0,
        Name: 'ford torino',
        index: 4,
        Acceleration: 10.5,
        Year: '1970-01-01',
        Weight_in_lbs: 3449,
        Cylinders: 8,
        Displacement: 302.0
      },
      {
        Horsepower: 198.0,
        Origin: 'USA',
        Miles_per_Gallon: 15.0,
        Name: 'ford galaxie 500',
        index: 5,
        Acceleration: 10.0,
        Year: '1970-01-01',
        Weight_in_lbs: 4341,
        Cylinders: 8,
        Displacement: 429.0
      },
      {
        Horsepower: 220.0,
        Origin: 'USA',
        Miles_per_Gallon: 14.0,
        Name: 'chevrolet impala',
        index: 6,
        Acceleration: 9.0,
        Year: '1970-01-01',
        Weight_in_lbs: 4354,
        Cylinders: 8,
        Displacement: 454.0
      },
      {
        Horsepower: 215.0,
        Origin: 'USA',
        Miles_per_Gallon: 14.0,
        Name: 'plymouth fury iii',
        index: 7,
        Acceleration: 8.5,
        Year: '1970-01-01',
        Weight_in_lbs: 4312,
        Cylinders: 8,
        Displacement: 440.0
      },
      {
        Horsepower: 225.0,
        Origin: 'USA',
        Miles_per_Gallon: 14.0,
        Name: 'pontiac catalina',
        index: 8,
        Acceleration: 10.0,
        Year: '1970-01-01',
        Weight_in_lbs: 4425,
        Cylinders: 8,
        Displacement: 455.0
      },
      {
        Horsepower: 190.0,
        Origin: 'USA',
        Miles_per_Gallon: 15.0,
        Name: 'amc ambassador dpl',
        index: 9,
        Acceleration: 8.5,
        Year: '1970-01-01',
        Weight_in_lbs: 3850,
        Cylinders: 8,
        Displacement: 390.0
      },
      {
        Horsepower: 115.0,
        Origin: 'Europe',
        Miles_per_Gallon: null,
        Name: 'citroen ds-21 pallas',
        index: 10,
        Acceleration: 17.5,
        Year: '1970-01-01',
        Weight_in_lbs: 3090,
        Cylinders: 4,
        Displacement: 133.0
      },
      {
        Horsepower: 165.0,
        Origin: 'USA',
        Miles_per_Gallon: null,
        Name: 'chevrolet chevelle concours (sw)',
        index: 11,
        Acceleration: 11.5,
        Year: '1970-01-01',
        Weight_in_lbs: 4142,
        Cylinders: 8,
        Displacement: 350.0
      },
      {
        Horsepower: 153.0,
        Origin: 'USA',
        Miles_per_Gallon: null,
        Name: 'ford torino (sw)',
        index: 12,
        Acceleration: 11.0,
        Year: '1970-01-01',
        Weight_in_lbs: 4034,
        Cylinders: 8,
        Displacement: 351.0
      },
      {
        Horsepower: 175.0,
        Origin: 'USA',
        Miles_per_Gallon: null,
        Name: 'plymouth satellite (sw)',
        index: 13,
        Acceleration: 10.5,
        Year: '1970-01-01',
        Weight_in_lbs: 4166,
        Cylinders: 8,
        Displacement: 383.0
      },
      {
        Horsepower: 175.0,
        Origin: 'USA',
        Miles_per_Gallon: null,
        Name: 'amc rebel sst (sw)',
        index: 14,
        Acceleration: 11.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3850,
        Cylinders: 8,
        Displacement: 360.0
      },
      {
        Horsepower: 170.0,
        Origin: 'USA',
        Miles_per_Gallon: 15.0,
        Name: 'dodge challenger se',
        index: 15,
        Acceleration: 10.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3563,
        Cylinders: 8,
        Displacement: 383.0
      },
      {
        Horsepower: 160.0,
        Origin: 'USA',
        Miles_per_Gallon: 14.0,
        Name: "plymouth 'cuda 340",
        index: 16,
        Acceleration: 8.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3609,
        Cylinders: 8,
        Displacement: 340.0
      },
      {
        Horsepower: 140.0,
        Origin: 'USA',
        Miles_per_Gallon: null,
        Name: 'ford mustang boss 302',
        index: 17,
        Acceleration: 8.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3353,
        Cylinders: 8,
        Displacement: 302.0
      },
      {
        Horsepower: 150.0,
        Origin: 'USA',
        Miles_per_Gallon: 15.0,
        Name: 'chevrolet monte carlo',
        index: 18,
        Acceleration: 9.5,
        Year: '1970-01-01',
        Weight_in_lbs: 3761,
        Cylinders: 8,
        Displacement: 400.0
      },
      {
        Horsepower: 225.0,
        Origin: 'USA',
        Miles_per_Gallon: 14.0,
        Name: 'buick estate wagon (sw)',
        index: 19,
        Acceleration: 10.0,
        Year: '1970-01-01',
        Weight_in_lbs: 3086,
        Cylinders: 8,
        Displacement: 455.0
      },
      {
        Horsepower: 95.0,
        Origin: 'Japan',
        Miles_per_Gallon: 24.0,
        Name: 'toyota corona mark ii',
        index: 20,
        Acceleration: 15.0,
        Year: '1970-01-01',
        Weight_in_lbs: 2372,
        Cylinders: 4,
        Displacement: 113.0
      },
      {
        Horsepower: 95.0,
        Origin: 'USA',
        Miles_per_Gallon: 22.0,
        Name: 'plymouth duster',
        index: 21,
        Acceleration: 15.5,
        Year: '1970-01-01',
        Weight_in_lbs: 2833,
        Cylinders: 6,
        Displacement: 198.0
      },
      {
        Horsepower: 97.0,
        Origin: 'USA',
        Miles_per_Gallon: 18.0,
        Name: 'amc hornet',
        index: 22,
        Acceleration: 15.5,
        Year: '1970-01-01',
        Weight_in_lbs: 2774,
        Cylinders: 6,
        Displacement: 199.0
      },
      {
        Horsepower: 85.0,
        Origin: 'USA',
        Miles_per_Gallon: 21.0,
        Name: 'ford maverick',
        index: 23,
        Acceleration: 16.0,
        Year: '1970-01-01',
        Weight_in_lbs: 2587,
        Cylinders: 6,
        Displacement: 200.0
      },
      {
        Horsepower: 88.0,
        Origin: 'Japan',
        Miles_per_Gallon: 27.0,
        Name: 'datsun pl510',
        index: 24,
        Acceleration: 14.5,
        Year: '1970-01-01',
        Weight_in_lbs: 2130,
        Cylinders: 4,
        Displacement: 97.0
      },
      {
        Horsepower: 46.0,
        Origin: 'Europe',
        Miles_per_Gallon: 26.0,
        Name: 'volkswagen 1131 deluxe sedan',
        index: 25,
        Acceleration: 20.5,
        Year: '1970-01-01',
        Weight_in_lbs: 1835,
        Cylinders: 4,
        Displacement: 97.0
      },
      {
        Horsepower: 87.0,
        Origin: 'Europe',
        Miles_per_Gallon: 25.0,
        Name: 'peugeot 504',
        index: 26,
        Acceleration: 17.5,
        Year: '1970-01-01',
        Weight_in_lbs: 2672,
        Cylinders: 4,
        Displacement: 110.0
      },
      {
        Horsepower: 90.0,
        Origin: 'Europe',
        Miles_per_Gallon: 24.0,
        Name: 'audi 100 ls',
        index: 27,
        Acceleration: 14.5,
        Year: '1970-01-01',
        Weight_in_lbs: 2430,
        Cylinders: 4,
        Displacement: 107.0
      },
      {
        Horsepower: 95.0,
        Origin: 'Europe',
        Miles_per_Gallon: 25.0,
        Name: 'saab 99e',
        index: 28,
        Acceleration: 17.5,
        Year: '1970-01-01',
        Weight_in_lbs: 2375,
        Cylinders: 4,
        Displacement: 104.0
      },
      {
        Horsepower: 113.0,
        Origin: 'Europe',
        Miles_per_Gallon: 26.0,
        Name: 'bmw 2002',
        index: 29,
        Acceleration: 12.5,
        Year: '1970-01-01',
        Weight_in_lbs: 2234,
        Cylinders: 4,
        Displacement: 121.0
      }
    ],
    schema: {
      primaryKey: ['index'],
      fields: [
        {
          name: 'index',
          type: 'integer'
        },
        {
          name: 'Acceleration',
          type: 'number'
        },
        {
          name: 'Cylinders',
          type: 'integer'
        },
        {
          name: 'Displacement',
          type: 'number'
        },
        {
          name: 'Horsepower',
          type: 'number'
        },
        {
          name: 'Miles_per_Gallon',
          type: 'number'
        },
        {
          name: 'Name',
          type: 'string'
        },
        {
          name: 'Origin',
          type: 'string'
        },
        {
          name: 'Weight_in_lbs',
          type: 'integer'
        },
        {
          name: 'Year',
          type: 'string'
        }
      ],
      pandas_version: '0.20.0'
    }
  };

  export const editable_test_data = {
    data: [
      {
        index: 0,
        link: ['https://www.chevrolet.com/', 'Chevrolet'],
        Name: 'Chevrolet',
        Contact: 'info@chevrolet.com',
        Origin: 'USA',
        Revenue: '$20-100 bn',
        Cylinders: [4, 8, 16],
        Horsepower: 130.0,
        Models: 2,
        Automatic: true,
        'Date in Service': '1980-01-02',
        'Corp. Data': { headquarter: 'USA', num_employees: 100, locations: 80 }
      },
      {
        index: 1,
        link: ['https://www.bmw.com/', 'BMW'],
        Name: 'BMW',
        Contact: 'info@bmw.com',
        Origin: 'Germany',
        Revenue: '$20-100 bn',
        Cylinders: [3, 6, 8, 16],
        Horsepower: 120.0,
        Models: 3,
        Automatic: true,
        'Date in Service': '1990-11-22',
        'Corp. Data': {
          headquarter: 'Germany',
          num_employees: 200,
          locations: 20
        }
      },
      {
        index: 2,
        link: ['https://www.mercedes-benz.com/', 'Mercedes'],
        Name: 'Mercedes',
        Contact: 'info@mbusa.com',
        Origin: 'Germany',
        Revenue: '$20-100 bn',
        Cylinders: [4, 8, 16],
        Horsepower: 100.0,
        Models: 5,
        Automatic: false,
        'Date in Service': '1970-06-13',
        'Corp. Data': {
          headquarter: 'Germany',
          num_employees: 250,
          locations: 45
        }
      },
      {
        index: 3,
        link: ['https://www.honda.com/', 'Honda'],
        Name: 'Honda',
        Contact: 'info@honda.com',
        Origin: 'Japan',
        Revenue: '$5-20 bn',
        Cylinders: [4],
        Horsepower: 90.0,
        Models: 5,
        Automatic: true,
        'Date in Service': '1985-05-09',
        'Corp. Data': {
          headquarter: 'Germany',
          num_employees: 200,
          locations: 40
        }
      },
      {
        index: 4,
        link: ['https://www.toyota.com/', 'Toyota'],
        Name: 'Toyota',
        Contact: 'info@toyota.com',
        Origin: 'Japan',
        Revenue: '$20-100 bn',
        Cylinders: [2, 3, 4, 6, 8, 16],
        Horsepower: 95.0,
        Models: 7,
        Automatic: true,
        'Date in Service': '1975-05-19',
        'Corp. Data': {
          headquarter: 'Japan',
          num_employees: 500,
          locations: 70
        }
      },
      {
        index: 5,
        link: ['https://www.renaultgroup.com/', 'Renault'],
        Name: 'Renault',
        Contact: 'info@renault.com',
        Origin: 'France',
        Revenue: '$1-5 bn',
        Cylinders: [2, 3, 4],
        Horsepower: 75.0,
        Models: 4,
        Automatic: false,
        'Date in Service': '1962-07-28',
        'Corp. Data': {
          headquarter: 'France',
          num_employees: 400,
          locations: 80
        }
      }
    ],
    schema: {
      primaryKey: ['index'],
      fields: [
        {
          name: 'index',
          type: 'integer'
        },
        {
          name: 'link',
          type: 'object'
        },
        {
          name: 'Name',
          type: 'string',
          constraint: {
            minLength: 2,
            maxLength: 100,
            pattern: '[a-zA-Z]'
          }
        },
        {
          name: 'Origin',
          type: 'string',
          constraint: {
            enum: 'dynamic'
          }
        },
        {
          name: 'Revenue',
          type: 'string',
          constraint: {
            enum: ['$1-5 bn', '$5-20 bn', '$20-100 bn']
          }
        },
        {
          name: 'Cylinders',
          type: 'array',
          constraint: {
            enum: [2, 3, 4, 6, 8, 16]
          }
        },
        {
          name: 'Horsepower',
          type: 'number',
          constraint: {
            minimum: 50,
            maximum: 900
          }
        },
        {
          name: 'Models',
          type: 'integer',
          constraint: {
            minimum: 1,
            maximum: 30
          }
        },
        {
          name: 'Automatic',
          type: 'boolean'
        },
        {
          name: 'Date in Service',
          type: 'date'
        },
        {
          name: 'Contact',
          type: 'string',
          format: 'email'
        },
        {
          name: 'Corp. Data',
          type: 'object'
        }
      ],
      pandas_version: '0.20.0'
    }
  };
}
