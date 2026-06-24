import * as React from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WidgetCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: WidgetCatalogItem[];
  activeWidgetIds: string[];
  onToggleWidget: (id: string) => void;
}

export function WidgetSelector({
  isOpen,
  onClose,
  catalog,
  activeWidgetIds,
  onToggleWidget,
}: WidgetSelectorProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="widget-catalog-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-card border-l border-border flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 id="widget-catalog-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Dashboard Widget Marketplace
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customize your Command Center by toggling operational widgets.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                  <X className="h-4.5 w-4.5" />
                </Button>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {catalog.map((item) => {
                  const isActive = activeWidgetIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                        isActive
                          ? 'border-primary/20 bg-primary/[0.01] shadow-sm'
                          : 'border-border/60 bg-card hover:bg-muted/10'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => onToggleWidget(item.id)}
                        className={`h-8 rounded-lg shrink-0 px-3 ${
                          isActive ? 'bg-primary text-white' : ''
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-muted/10 flex justify-end">
                <Button onClick={onClose} className="rounded-xl bg-primary hover:bg-primary/95 text-white">
                  Done Config
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default WidgetSelector;
