import { watch, onMounted, onUnmounted, toRefs } from 'vue';
import type { Ref } from 'vue';
import { getElement } from '../../shared/util/dom';
import { UseDropdownProps, EmitEvent } from './dropdown-types';

const dropdownMap = new Map();

function subscribeEvent(dom: Element | Document, type: string, callback: (event: any) => void) {
  dom?.addEventListener(type, callback);
  return () => {
    dom?.removeEventListener(type, callback);
  };
}

export const useDropdownEvent = ({ id, isOpen, origin, dropdownRef, props, emit }: UseDropdownProps): void => {
  let overlayEnter = false;
  let originEnter = false;
  const { trigger, closeScope, closeOnMouseLeaveMenu } = toRefs(props);
  const toggle = (status: boolean) => {
    isOpen.value = status;
    emit('toggle', isOpen.value);
  };
  const handleLeave = async (elementType: 'origin' | 'dropdown', e?) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    if ((elementType === 'origin' && overlayEnter) || (elementType === 'dropdown' && originEnter)) {
      return;
    }
    if (e) {
      [...dropdownMap.values()].reverse().forEach((item) => {
        setTimeout(() => {
          item.toggle?.();
        }, 0);
      });
    }
    toggle(false);
  };
  watch([trigger, origin, dropdownRef], ([triggerVal, originVal, dropdownEl], ov, onInvalidate) => {
    const originEl = getElement(originVal);
    const subscriptions = [];
    setTimeout(() => {
      subscriptions.push(
        subscribeEvent(document, 'click', (e: Event) => {
          const dropdownValues = [...dropdownMap.values()];
          if (
            !isOpen.value ||
            closeScope.value === 'none' ||
            (dropdownEl.contains(e.target) && closeScope.value === 'blank') ||
            (dropdownValues.some((item) => item.toggleEl?.contains(e.target)) &&
              dropdownValues.some((item) => item.menuEl?.contains(e.target)))
          ) {
            return;
          }
          [...dropdownMap.values()].reverse().forEach((item) => {
            setTimeout(() => {
              if (!item.toggleEl?.contains(e.target)) {
                item.toggle?.();
              }
            }, 0);
          });
          overlayEnter = false;
        })
      );
    }, 0);
    if (triggerVal === 'click') {
      subscriptions.push(
        subscribeEvent(originEl, 'click', () => toggle(!isOpen.value)),
        subscribeEvent(dropdownEl, 'mouseleave', (e: MouseEvent) => {
          if (closeOnMouseLeaveMenu.value && !dropdownMap.get(id).child?.contains(e.relatedTarget)) {
            handleLeave('dropdown', e);
          }
        })
      );
    } else if (triggerVal === 'hover') {
      subscriptions.push(
        subscribeEvent(originEl, 'mouseenter', () => {
          originEnter = true;
          toggle(true);
        }),
        subscribeEvent(originEl, 'mouseleave', () => {
          originEnter = false;
          handleLeave('origin');
        }),
        subscribeEvent(dropdownEl, 'mouseenter', () => {
          overlayEnter = true;
          isOpen.value = true;
        }),
        subscribeEvent(dropdownEl, 'mouseleave', (e: MouseEvent) => {
          overlayEnter = false;
          if (e.relatedTarget && (originEl?.contains(e.relatedTarget) || dropdownMap.get(id).child?.contains(e.relatedTarget))) {
            return;
          }
          handleLeave('dropdown', e);
        })
      );
    }
    onInvalidate(() => subscriptions.forEach((v) => v()));
  });
};

export function useDropdown(
  id: string,
  visible: Ref<boolean>,
  isOpen: Ref<boolean>,
  origin: Ref<HTMLElement>,
  dropdownRef: Ref<HTMLElement>,
  popDirection: Ref<string>,
  emit: EmitEvent
): void {
  const calcPopDirection = (dropdownEl: HTMLElement) => {
    const elementHeight = dropdownEl.offsetHeight;
    const bottomDistance = window.innerHeight - origin.value.getBoundingClientRect().bottom;
    const isBottomEnough = bottomDistance >= elementHeight;
    if (!isBottomEnough) {
      popDirection.value = 'top';
    } else {
      popDirection.value = 'bottom';
    }
  };

  watch(
    visible,
    (newVal, oldVal) => {
      if (oldVal === undefined) {
        return;
      }
      isOpen.value = newVal;
      emit('toggle', isOpen.value);
    },
    { immediate: true }
  );
  watch([isOpen, dropdownRef], ([isOpenVal, dropdownEl]) => {
    if (isOpenVal) {
      dropdownMap.set(id, {
        ...dropdownMap.get(id),
        menuEl: dropdownEl,
        toggle: () => {
          isOpen.value = false;
          emit('toggle', isOpen.value);
        },
      });
      for (const value of dropdownMap.values()) {
        if (value.menuEl?.contains(origin.value)) {
          value.child = dropdownEl;
        }
      }
    }
    if (dropdownEl) {
      calcPopDirection(dropdownEl);
    }
  });
  onMounted(() => {
    dropdownMap.set(id, { toggleEl: origin.value });
  });
  onUnmounted(() => {
    dropdownMap.delete(id);
  });
}
