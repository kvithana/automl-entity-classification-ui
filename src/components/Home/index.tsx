import React, { useState, useEffect, useReducer } from 'react'
import { annotationReducer, initialState } from './reducer'
import copy from 'copy-to-clipboard'

let lastCaught: [number, number, number] = [0, 0, 0]

const Home = (): JSX.Element => {
  const [input, setInput] = useState('')
  const [state, dispatch] = useReducer(annotationReducer, initialState)
  const [selectedButton, setSelectedButton] = useState(0)
  const [jsondata, setJsondata] = useState<null | unknown>(null)

  useEffect(() => {
    const arr: any[] = []
    if (state.active_ingredient.length) {
      state.active_ingredient.map((i) =>
        arr.push({ text_extraction: { text_segment: i }, display_name: 'ActiveIngredient' }),
      )
    }
    if (state.frequency.length) {
      state.frequency.map((i) => arr.push({ text_extraction: { text_segment: i }, display_name: 'DoseFrequency' }))
    }
    if (state.medication.length) {
      state.medication.map((i) => arr.push({ text_extraction: { text_segment: i }, display_name: 'MedicationTitle' }))
    }
    if (state.dosage.length) {
      state.dosage.map((i) => arr.push({ text_extraction: { text_segment: i }, display_name: 'Dosage' }))
    }
    setJsondata({ annotations: arr, text_snippet: { content: input } })
  }, [state, input])

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    dispatch({ type: 'clear' })
  }

  const onClear = () => {
    dispatch({ type: 'clear' })
  }

  const selectButton = (i: number) => {
    setSelectedButton(i)
  }

  const resetButton = () => {
    setSelectedButton(0)
  }

  const onCopy = () => {
    copy(JSON.stringify(jsondata, null, 4))
  }

  useEffect(() => {
    const handleMouseUp = () => {
      const t = document.getSelection()
      if (t && t.focusOffset && selectedButton && t.anchorNode?.parentElement?.id === 'input-selection') {
        console.log(selectedButton)
        const range = t.getRangeAt(0)
        if (lastCaught[0] === selectedButton && lastCaught[1] === t.anchorOffset && lastCaught[2] === t.focusOffset) {
          return
        } else {
          lastCaught = [selectedButton, t.anchorOffset, t.focusOffset]
          resetButton()
        }
        if (range.startOffset === input.length - 1 || !(range.endOffset - range.startOffset)) {
          return
        }

        switch (selectedButton.toString()) {
          case '1':
            dispatch({
              type: 'add',
              payload: {
                type: 'active_ingredient',
                data: { start_offset: range.startOffset, end_offset: range.endOffset },
              },
            })
            break
          case '2':
            dispatch({
              type: 'add',
              payload: {
                type: 'frequency',
                data: { start_offset: range.startOffset, end_offset: range.endOffset },
              },
            })
            break
          case '3':
            dispatch({
              type: 'add',
              payload: {
                type: 'medication',
                data: { start_offset: range.startOffset, end_offset: range.endOffset },
              },
            })
            break
          case '4':
            dispatch({
              type: 'add',
              payload: {
                type: 'dosage',
                data: { start_offset: range.startOffset, end_offset: range.endOffset },
              },
            })
            break
          default:
            return
        }
      }
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [selectedButton, input])

  return (
    <div className="container mx-auto mt-12 mb-12">
      <div className="flex flex-col items-center">
        <textarea
          value={input}
          onChange={onInputChange}
          placeholder="Paste initial text here and then use highlighting tools on below textbox..."
          rows={10}
          className="bg-gray-200 rounded-md w-full box-border text-gray-500 p-2"
        />

        <div className="flex justify-between mt-5">
          <button
            onClick={() => selectButton(1)}
            className={`${selectedButton === 1 ? 'bg-yellow-500' : 'bg-gray-400'} text-white p-2 m-2 rounded-md`}
          >
            Active Ingredient
          </button>
          <button
            onClick={() => selectButton(2)}
            className={`${selectedButton === 2 ? 'bg-green-400' : 'bg-gray-400'} text-white p-2 m-2 rounded-md`}
          >
            Frequency
          </button>
          <button
            onClick={() => selectButton(4)}
            className={`${selectedButton === 4 ? 'bg-orange-400' : 'bg-gray-400'} text-white p-2 m-2 rounded-md`}
          >
            Dosage
          </button>
          <button
            onClick={() => selectButton(3)}
            className={`${selectedButton === 3 ? 'bg-pink-400' : 'bg-gray-400'} text-white p-2 m-2 rounded-md`}
          >
            Medication Title
          </button>
          <button onClick={onClear} className="p-2 m-2 rounded-md border border-gray-500 text-gray-600">
            Reset
          </button>
        </div>

        <div id="input-selection" className="w-full bg-gray-900 text-white rounded-md mt-8 mb-8 p-5">
          {input}
        </div>

        <div className="w-full flex bg-gray-100 rounded-md p-5 items-center">
          <div className="pr-2">Medication Title:</div>{' '}
          <div className="flex">
            {state.medication.map((i) => (
              <div key={i.start_offset} className="p-1 rounded-md bg-pink-400 text-white mr-1">
                {input.slice(i.start_offset, i.end_offset)}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full flex bg-gray-100 rounded-md mt-5 p-5 items-center">
          <div className="pr-2">Active Ingredients:</div>{' '}
          <div className="flex">
            {state.active_ingredient.map((i) => (
              <div key={i.start_offset} className="p-1 rounded-md bg-yellow-500 text-white mr-1">
                {input.slice(i.start_offset, i.end_offset)}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full flex bg-gray-100 rounded-md mt-5 p-5 items-center">
          <div className="pr-2">Frequency:</div>{' '}
          <div className="flex">
            {state.frequency.map((i) => (
              <div key={i.start_offset} className="p-1 rounded-md bg-green-400 text-white mr-1">
                {input.slice(i.start_offset, i.end_offset)}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full flex bg-gray-100 rounded-md mt-5 p-5 items-center">
          <div className="pr-2">Dosage:</div>{' '}
          <div className="flex">
            {state.dosage.map((i) => (
              <div key={i.start_offset} className="p-1 rounded-md bg-orange-400 text-white mr-1">
                {input.slice(i.start_offset, i.end_offset)}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-200 rounded-md w-full mt-5 p-2 text-purple-800">
          <pre>
            <code>{JSON.stringify(jsondata, null, 4)}</code>
          </pre>
        </div>
        <div className="flex flex-row-reverse w-full" style={{ overflowWrap: 'break-word' }}>
          <button className="p-2 m-2 rounded-md bg-blue-900 text-white" onClick={onCopy}>
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
