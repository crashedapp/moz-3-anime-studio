import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PARTS, DEFAULT_EXP_SETTINGS } from '../App';

export default function ExpressionTabs({ tabs, activeId, onSelect, setTabs }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key;
            const matchedTab = tabs.find(t => t.keybind === key);
            if (matchedTab) {
                onSelect(matchedTab.id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [tabs, onSelect]);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const handleAdd = () => {
        if (tabs.length >= 8) {
            alert("Maximum of 8 tabs allowed.");
            return;
        }

        const newId = String(Date.now());
        const newIndex = tabs.length + 1;
        const keybind = newIndex <= 9 ? String(newIndex) : '';
        setTabs([...tabs, {
            id: newId,
            name: 'Double click to edit tab name',
            keybind,
            parts: { ...DEFAULT_PARTS },
            settings: { ...DEFAULT_EXP_SETTINGS }
        }]);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (tabs.length === 1) {
            alert("The last expression cannot be deleted.");
            return;
        }
        if (window.confirm("Do you want to delete this tab?")) {
            const newTabs = tabs.filter(t => t.id !== id);
            setTabs(newTabs);
            if (activeId === id) {
                onSelect(newTabs[0].id);
            }
        }
    };

    const handleDoubleClick = (id, currentName) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const handleNameChange = (e) => {
        setEditName(e.target.value);
    };

    const commitNameChange = () => {
        if (editingId) {
            const finalName = editName.trim() === "" ? "Unnamed" : editName;

            // Validation: Ensure at least one tab is not a shift tab
            if (finalName.includes('Change')) {
                const otherTabs = tabs.filter(t => t.id !== editingId);
                const nonLolOtherTabs = otherTabs.filter(t => !t.name.includes('Change'));
                if (nonLolOtherTabs.length === 0) {
                    alert("You cannot name all tabs 'Change'. Please keep at least one tab with a different name!");
                    setEditingId(null);
                    return;
                }
            }

            setTabs(tabs.map(t => t.id === editingId ? { ...t, name: finalName } : t));
            setEditingId(null);
        }
    };

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            commitNameChange();
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div className="expression-tabs">
            {tabs.map(tab => (
                <div key={tab.id} className={`tab ${activeId === tab.id ? 'active' : ''}`}
                    onClick={() => onSelect(tab.id)}
                    onDoubleClick={() => handleDoubleClick(tab.id, tab.name)}
                >
                    {editingId === tab.id ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={editName}
                            onChange={handleNameChange}
                            onBlur={commitNameChange}
                            onKeyDown={handleNameKeyDown}
                            className="tab-input"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <>{tab.name}</>
                    )}

                    <span className="keybind-hint" style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: '4px' }}>
                        [{tab.keybind}]
                    </span>
                    {tabs.length > 1 && (
                        <button className="tab-delete" onClick={(e) => handleDelete(e, tab.id)} title="Delete">×</button>
                    )}
                </div>
            ))}
            {tabs.length < 8 && (
                <button className="add-tab-btn" onClick={handleAdd} title="Add a new tab">+</button>
            )}
        </div>
    );
}
