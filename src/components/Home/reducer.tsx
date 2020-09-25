interface SegmentData {
  end_offset: number
  start_offset: number
}

interface AnnotationState {
  medication: SegmentData[]
  active_ingredient: SegmentData[]
  frequency: SegmentData[]
}

interface Action {
  type: 'add' | 'clear'
  payload?: {
    type: 'medication' | 'active_ingredient' | 'frequency'
    data: SegmentData
  }
}

export const initialState: AnnotationState = {
  medication: [],
  active_ingredient: [],
  frequency: [],
}

export const annotationReducer = (state: AnnotationState, action: Action) => {
  console.log(state, action)
  switch (action.type) {
    case 'add':
      if (action.payload) {
        console.log('final', {
          ...state,
          [action.payload.type]: state[action.payload.type].concat([action.payload.data]),
        })
        return { ...state, [action.payload.type]: state[action.payload.type].concat([action.payload.data]) }
      }
      return state
    case 'clear':
      return initialState
    default:
      return state
  }
}
