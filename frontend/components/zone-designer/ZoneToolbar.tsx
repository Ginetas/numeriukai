'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { ZoneType } from './hooks/useZoneDesigner';

interface ZoneToolbarProps {
  name: string;
  type: ZoneType;
  onNameChange: (value: string) => void;
  onTypeChange: (value: ZoneType) => void;
  onUndo: () => void;
  onClear: () => void;
  onFinish: () => void;
  onSave: () => void;
}

export function ZoneToolbar({
  name,
  type,
  onNameChange,
  onTypeChange,
  onUndo,
  onClear,
  onFinish,
  onSave,
}: ZoneToolbarProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="min-w-[220px] flex-1 space-y-1">
        <label className="text-xs text-slate-600">Zone name</label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Loading Bay"
        />
      </div>
      <div className="w-40 space-y-1">
        <label className="text-xs text-slate-600">Zone type</label>
        <Select value={type} onChange={(e) => onTypeChange(e.target.value as ZoneType)}>
          <option value="Entry">Entry</option>
          <option value="Exit">Exit</option>
          <option value="Control">Control</option>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onUndo}>
          Undo
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear
        </Button>
        <Button variant="ghost" onClick={onFinish}>
          Finish
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
