# React Patterns Guide - Best Practices

## 1. Derived State Pattern

### ❌ WRONG: Derived State Anti-Pattern
```javascript
const [items, setItems] = useState([]);
const [filtered, setFiltered] = useState([]);

useEffect(() => {
    setFiltered(items.filter(item => item.active));
}, [items]); // Causes extra render!
```

### ✅ CORRECT: Compute Directly
```javascript
const [items, setItems] = useState([]);

const filtered = useMemo(() => {
    return items.filter(item => item.active);
}, [items]); // Single source of truth
```

## 2. Dependency Array Management

### ❌ WRONG: Missing Dependencies
```javascript
const handleClick = useCallback(() => {
    console.log(userId); // Uses stale value!
}, []); // Missing userId dependency
```

### ✅ CORRECT: Include All Dependencies
```javascript
const handleClick = useCallback(() => {
    console.log(userId);
}, [userId]); // Includes all dependencies
```

## 3. localStorage Access

### ❌ WRONG: Read on Every Render
```javascript
const userId = localStorage.getItem("user_id");
// Called on every render!
```

### ✅ CORRECT: Cache with useRef
```javascript
const userId = useRef(localStorage.getItem("user_id")).current;
// Called only once on mount
```

## 4. Filtering/Sorting Data

### ❌ WRONG: Multiple State Sources
```javascript
const [data, setData] = useState([]);
const [filtered, setFiltered] = useState([]);

useEffect(() => {
    setFiltered(data.filter(...));
}, [data]); // Unnecessary state update
```

### ✅ CORRECT: Single Memoized Source
```javascript
const [data, setData] = useState([]);

const filtered = useMemo(() => {
    return data.filter(...);
}, [data]); // Computed on demand
```

## 5. Event Handler Optimization

### ❌ WRONG: New Function on Every Render
```javascript
<button onClick={() => handleClick(id)}>
    Click me
</button>
// New function created on every render!
```

### ✅ CORRECT: Memoized Callback
```javascript
const handleClick = useCallback((id) => {
    // Handle click
}, [dependencies]);

<button onClick={() => handleClick(id)}>
    Click me
</button>
```

## 6. Grouping/Transforming Data

### ❌ WRONG: Computed in Render
```javascript
const grouped = items.reduce((acc, item) => {
    // Computed on every render!
    return acc;
}, {});
```

### ✅ CORRECT: Memoized Computation
```javascript
const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
        return acc;
    }, {});
}, [items]); // Computed only when items change
```

## 7. Conditional Rendering

### ❌ WRONG: Complex Logic in JSX
```javascript
{items.length > 0 && items.filter(i => i.active).map(item => (
    <Item key={item.id} item={item} />
))}
```

### ✅ CORRECT: Compute First
```javascript
const activeItems = useMemo(() => {
    return items.filter(i => i.active);
}, [items]);

{activeItems.length > 0 && activeItems.map(item => (
    <Item key={item.id} item={item} />
))}
```

## 8. API Calls with Dependencies

### ❌ WRONG: Unstable Dependencies
```javascript
const fetchData = useCallback(async () => {
    const response = await fetch(`/api/${id}`);
    return response.json();
}, []); // Missing id dependency!
```

### ✅ CORRECT: Include All Dependencies
```javascript
const fetchData = useCallback(async () => {
    const response = await fetch(`/api/${id}`);
    return response.json();
}, [id]); // Includes id dependency
```

## 9. Modal/Dialog Management

### ❌ WRONG: Multiple State Sources
```javascript
const [isOpen, setIsOpen] = useState(false);
const [modalState, setModalState] = useState({});

useEffect(() => {
    if (isOpen) {
        setModalState({...}); // Causes extra render
    }
}, [isOpen]);
```

### ✅ CORRECT: Single State Source
```javascript
const [isOpen, setIsOpen] = useState(false);

const modalState = useMemo(() => {
    return isOpen ? {...} : {};
}, [isOpen]); // Computed directly
```

## 10. Performance Monitoring

### ✅ CORRECT: Track Expensive Operations
```javascript
const expensiveData = useMemo(() => {
    console.time('expensive-operation');
    const result = complexCalculation();
    console.timeEnd('expensive-operation');
    return result;
}, [dependencies]);
```

## Summary

| Pattern | Use Case | Hook |
|---------|----------|------|
| Derived State | Compute from other state | `useMemo` |
| Event Handlers | Stable function references | `useCallback` |
| Cached Values | Values that don't trigger renders | `useRef` |
| Side Effects | Run code on mount/update | `useEffect` |
| Expensive Computations | Cache results | `useMemo` |

## Key Rules

1. **Single Source of Truth**: Don't duplicate data in state
2. **Stable Dependencies**: Include all dependencies in arrays
3. **Memoize Expensive Operations**: Use useMemo for complex calculations
4. **Stable Callbacks**: Use useCallback for event handlers
5. **Proper Cleanup**: Return cleanup functions from useEffect
6. **Avoid localStorage in Render**: Cache with useRef
7. **No setState in Render**: Use useMemo for derived state

