import { PropType, ExtractPropTypes } from 'vue';

type AppendToBodyDirection = 'rightDown' | 'rightUp' | 'leftUp' | 'leftDown' | 'centerDown' | 'centerUp';

interface ConnectedPosition {
  originX: 'start' | 'center' | 'end';
  originY: 'top' | 'center' | 'bottom';

  overlayX: 'start' | 'center' | 'end';
  overlayY: 'top' | 'center' | 'bottom';

  weight?: number;
  offsetX?: number;
  offsetY?: number;
  panelClass?: string | string[];
}

type Size = 'lg' | '' | 'sm';

export const componentProps = {
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  },
  pageSizeOptions: {
    type: Array as PropType<number[]>,
    default: () => [5, 10, 20, 50]
  },
  pageSizeDirection: {
    type: Array as PropType<Array<AppendToBodyDirection | ConnectedPosition>>,
    default: () => ['centerDown', 'centerUp']
  },
  pageIndex: {
    type: Number,
    default: 1
  },
  maxItems: {
    type: Number,
    default: 10
  },
  preLink: {
    type: String,
    default: '&lt;'
  },
  nextLink: {
    type: String,
    default: '&gt;'
  },
  size: {
    type: String as PropType<Size>,
    default: ''
  },
  canJumpPage: {
    type: Boolean,
    default: false
  },
  canChangePageSize: {
    type: Boolean,
    default: false
  },
  canViewTotal: {
    type: Boolean,
    default: false
  },
  totalItemText: {
    type: String,
    default: '所有条目'
  },
  goToText: {
    type: String,
    default: '跳至'
  },
  showJumpButton: {
    type: Boolean,
    default: false
  },
  showTruePageIndex: {
    type: Boolean,
    default: false
  },
  lite: {
    type: Boolean,
    default: false
  },
  showPageSelector: {
    type: Boolean,
    default: true
  },
  haveConfigMenu: {
    type: Boolean,
    default: false
  },
  autoFixPageIndex: {
    type: Boolean,
    default: true
  },
  autoHide: {
    type: Boolean,
    default: false
  },
  'onUpdate:pageIndex': {
    type: Function as PropType<(v: number) => void>
  },
  'onUpdate:pageSize': {
    type: Function as PropType<(v: number) => void>
  },
  'onPageIndexChange': {
    type: Function as PropType<(v: number) => void>
  },
  'onPageSizeChange': {
    type: Function as PropType<(v: number) => void>
  }
} as const;

// 组件props
export type ComponentProps = ExtractPropTypes<typeof componentProps>;
