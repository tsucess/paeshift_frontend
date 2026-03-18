# Code Examples - Notification Feature Implementation

## Example 1: Derived State Pattern

### ❌ WRONG: Multiple State Sources
```javascript
const [items, setItems] = useState([]);
const [filtered, setFiltered] = useState([]);

useEffect(() => {
    setFiltered(items.filter(item => item.active));
}, [items]); // Causes extra render!

// Usage
return <div>{filtered.map(item => <Item key={item.id} item={item} />)}</div>;
```

### ✅ CORRECT: Single Memoized Source
```javascript
const [items, setItems] = useState([]);

const filtered = useMemo(() => {
    return items.filter(item => item.active);
}, [items]); // Single source of truth

// Usage
return <div>{filtered.map(item => <Item key={item.id} item={item} />)}</div>;
```

## Example 2: Filtering with Multiple Criteria

### ❌ WRONG: Unstable Callback
```javascript
const applyFilter = useCallback((filter, list) => {
    switch (filter) {
        case "active": return list.filter(i => i.active);
        case "inactive": return list.filter(i => !i.active);
        default: return list;
    }
}, []); // Empty dependencies!

const filtered = useMemo(() => {
    return applyFilter(activeFilter, items);
}, [items, activeFilter, applyFilter]); // Depends on unstable callback
```

### ✅ CORRECT: Inline Logic
```javascript
const filtered = useMemo(() => {
    switch (activeFilter) {
        case "active": return items.filter(i => i.active);
        case "inactive": return items.filter(i => !i.active);
        default: return items;
    }
}, [items, activeFilter]); // No callback needed
```

## Example 3: localStorage Access

### ❌ WRONG: Read on Every Render
```javascript
const userId = localStorage.getItem("user_id");

useEffect(() => {
    fetchUserData(userId); // Called on every render!
}, [userId]);
```

### ✅ CORRECT: Cache with useRef
```javascript
const userId = useRef(localStorage.getItem("user_id")).current;

useEffect(() => {
    fetchUserData(userId); // Called only once
}, [userId]); // userId never changes
```

## Example 4: Event Handler Optimization

### ❌ WRONG: New Function on Every Render
```javascript
const handleClick = (id) => {
    console.log(id);
};

return <button onClick={() => handleClick(id)}>Click</button>;
// New function created on every render!
```

### ✅ CORRECT: Memoized Callback
```javascript
const handleClick = useCallback((id) => {
    console.log(id);
}, [id]); // Stable reference

return <button onClick={() => handleClick(id)}>Click</button>;
```

## Example 5: Grouping Data

### ❌ WRONG: Computed in Render
```javascript
const grouped = items.reduce((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
}, {}); // Computed on every render!

return <div>{Object.entries(grouped).map(...)}</div>;
```

### ✅ CORRECT: Memoized Computation
```javascript
const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
        const key = item.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}, [items]); // Computed only when items change

return <div>{Object.entries(grouped).map(...)}</div>;
```

## Example 6: Notification Modal (Actual Implementation)

### Component Structure
```javascript
const Notificationmodal = ({ notificationData, refetchNotifications }) => {
    // STATE
    const [activeFilter, setActiveFilter] = useState('all');
    const [markingAsRead, setMarkingAsRead] = useState({});
    const currentUserId = useRef(localStorage.getItem("user_id")).current;

    // FETCH
    const fetchNotifications = useCallback(async () => {
        const { data } = await Axios.get(getApiUrl(`notifications/${currentUserId}/`));
        return data?.data?.notifications || [];
    }, [currentUserId]);

    const { data: notifications = [] } = useQuery({
        queryKey: ['modalNotifications', currentUserId],
        queryFn: fetchNotifications,
        enabled: Boolean(currentUserId) && !notificationData,
    });

    // DATA PROCESSING
    const notificationsList = useMemo(() => {
        return notificationData?.notifications || notifications;
    }, [notificationData, notifications]);

    const filteredNotifications = useMemo(() => {
        if (!Array.isArray(notificationsList)) return [];
        switch (activeFilter) {
            case "read": return notificationsList.filter(n => n.is_read);
            case "unread": return notificationsList.filter(n => !n.is_read);
            default: return notificationsList;
        }
    }, [notificationsList, activeFilter]);

    // HANDLERS
    const handleFilterChange = useCallback((filter) => {
        setActiveFilter(filter);
    }, []);

    const handleReadNotification = useCallback((notificationId) => {
        // Implementation
    }, [currentUserId, markingAsRead, refetchNotifications]);

    // UTILITIES
    const groupedNotifications = useMemo(() => {
        // Group by date
    }, [filteredNotifications]);

    // RENDER
    return <div>...</div>;
};
```

## Key Patterns

| Pattern | Use Case | Hook |
|---------|----------|------|
| Derived State | Compute from other state | `useMemo` |
| Event Handlers | Stable function references | `useCallback` |
| Cached Values | Values that don't trigger renders | `useRef` |
| Side Effects | Run code on mount/update | `useEffect` |
| Expensive Computations | Cache results | `useMemo` |
| Grouping/Sorting | Transform data | `useMemo` |
| Filtering | Filter data | `useMemo` |

