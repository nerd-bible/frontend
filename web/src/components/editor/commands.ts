import type { Command } from "prosemirror-state";
import type { MarkType } from "prosemirror-model";

/// Create a command function that toggles the given mark with the
/// given attributes. Will return `false` when the current selection
/// doesn't support that mark. This will remove the mark if any marks
/// of that type exist in the selection, or add it otherwise. If the
/// selection is empty, this applies to the [stored
/// marks](#state.EditorState.storedMarks) instead of a range of the
/// document.
export function toggleDecoration(markType: MarkType, attrs: Attrs | null = null, options?: {
  /// Controls whether, when part of the selected range has the mark
  /// already and part doesn't, the mark is removed (`true`, the
  /// default) or added (`false`).
  removeWhenPresent?: boolean
  /// When set to false, this will prevent the command from acting on
  /// the content of inline nodes marked as
  /// [atoms](#model.NodeSpec.atom) that are completely covered by a
  /// selection range.
  enterInlineAtoms?: boolean
  /// By default, this command doesn't apply to leading and trailing
  /// whitespace in the selection. Set this to `true` to change that.
  includeWhitespace?: boolean
}): Command {
  let removeWhenPresent = (options && options.removeWhenPresent) !== false
  let enterAtoms = (options && options.enterInlineAtoms) !== false
  let dropSpace = !(options && options.includeWhitespace)
  return function(state, dispatch) {
    let {empty, $cursor, ranges} = state.selection as TextSelection
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType, enterAtoms)) return false
    if (dispatch) {
      if ($cursor) {
        if (markType.isInSet(state.storedMarks || $cursor.marks()))
          dispatch(state.tr.removeStoredMark(markType))
        else
          dispatch(state.tr.addStoredMark(markType.create(attrs)))
      } else {
        let add, tr = state.tr
        if (!enterAtoms) ranges = removeInlineAtoms(ranges)
        if (removeWhenPresent) {
          add = !ranges.some(r => state.doc.rangeHasMark(r.$from.pos, r.$to.pos, markType))
        } else {
          add = !ranges.every(r => {
            let missing = false
            tr.doc.nodesBetween(r.$from.pos, r.$to.pos, (node, pos, parent) => {
              if (missing) return false
              missing = !markType.isInSet(node.marks) && !!parent && parent.type.allowsMarkType(markType) &&
                !(node.isText && /^\s*$/.test(node.textBetween(Math.max(0, r.$from.pos - pos),
                                                               Math.min(node.nodeSize, r.$to.pos - pos))))
            })
            return !missing
          })
        }
        for (let i = 0; i < ranges.length; i++) {
          let {$from, $to} = ranges[i]
          if (!add) {
            tr.removeMark($from.pos, $to.pos, markType)
          } else {
            let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore
            let spaceStart = dropSpace && start && start.isText ? /^\s*/.exec(start.text!)![0].length : 0
            let spaceEnd = dropSpace && end && end.isText ? /\s*$/.exec(end.text!)![0].length : 0
            if (from + spaceStart < to) { from += spaceStart; to -= spaceEnd }
            tr.addMark(from, to, markType.create(attrs))
          }
        }
        dispatch(tr.scrollIntoView())
      }
    }
    return true
  }
}
