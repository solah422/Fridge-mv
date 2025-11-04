import React, { useState } from 'react';
import { Customer, CustomerGroup } from '../types';
import { useAppDispatch } from '../store/hooks';
import { updateCustomerGroups } from '../store/slices/customerGroupsSlice';
import { updateCustomers } from '../store/slices/customersSlice';

interface ManageGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: CustomerGroup[];
  customers: Customer[];
}

export const ManageGroupsModal: React.FC<ManageGroupsModalProps> = ({ isOpen, onClose, groups, customers }) => {
  const dispatch = useAppDispatch();
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<{ id: number; name: string } | null>(null);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    if (newGroupName.trim() === '') return;
    const newGroup: CustomerGroup = { id: Date.now(), name: newGroupName.trim() };
    dispatch(updateCustomerGroups([...groups, newGroup]));
    setNewGroupName('');
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || editingGroup.name.trim() === '') return;
    const updatedGroups = groups.map(g => g.id === editingGroup.id ? { ...g, name: editingGroup.name.trim() } : g);
    dispatch(updateCustomerGroups(updatedGroups));
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId: number) => {
    if (window.confirm("Are you sure you want to delete this group? Customers in this group will be unassigned.")) {
      // Unassign customers from this group
      const updatedCustomers = customers.map(c => c.groupId === groupId ? { ...c, groupId: undefined } : c);
      dispatch(updateCustomers(updatedCustomers));
      
      // Delete the group
      const updatedGroups = groups.filter(g => g.id !== groupId);
      dispatch(updateCustomerGroups(updatedGroups));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Manage Customer Groups</h3>
          <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Add New Group</label>
            <div className="flex gap-2">
              <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" placeholder="e.g., Office Staff"/>
              <button onClick={handleAddGroup} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md whitespace-nowrap">Add Group</button>
            </div>
          </div>
          <div className="space-y-2">
            {groups.map(group => (
              <div key={group.id} className="flex items-center justify-between p-2 bg-[rgb(var(--color-bg-subtle))] rounded-md">
                {editingGroup?.id === group.id ? (
                  <input type="text" value={editingGroup.name} onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })} className="w-full p-1 border rounded" />
                ) : (
                  <span className="font-medium">{group.name}</span>
                )}
                <div className="flex gap-2 ml-4">
                  {editingGroup?.id === group.id ? (
                    <button onClick={handleUpdateGroup} className="text-sm text-green-600">Save</button>
                  ) : (
                    <button onClick={() => setEditingGroup({ id: group.id, name: group.name })} className="text-sm text-[rgb(var(--color-primary))]">Edit</button>
                  )}
                  <button onClick={() => handleDeleteGroup(group.id)} className="text-sm text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Close</button>
        </div>
      </div>
    </div>
  );
};
