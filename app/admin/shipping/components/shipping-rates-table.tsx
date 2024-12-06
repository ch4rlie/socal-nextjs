import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShippingRate, ProductCategory, ShippingRegion } from '@/types/shipping'
import { Edit2, Trash2, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface EditingRate extends Partial<ShippingRate> {
  isNew?: boolean
}

interface ShippingRatesTableProps {
  rates: ShippingRate[]
  onRateChange: () => void
}

export function ShippingRatesTable({ rates, onRateChange }: ShippingRatesTableProps) {
  const [editingRate, setEditingRate] = useState<EditingRate | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = (rate: ShippingRate) => {
    setEditingRate(rate)
  }

  const handleAdd = () => {
    setEditingRate({
      isNew: true,
      product_category: 'DEFAULT',
      region: 'USA',
      base_rate: 0,
      additional_item_rate: 0
    })
  }

  const handleCancel = () => {
    setEditingRate(null)
  }

  const handleSave = async () => {
    if (!editingRate?.product_category || !editingRate?.region) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_category: editingRate.product_category,
          region: editingRate.region,
          base_rate: Number(editingRate.base_rate),
          additional_item_rate: Number(editingRate.additional_item_rate)
        })
      })

      if (!response.ok) throw new Error('Failed to save shipping rate')

      toast.success('Shipping rate saved successfully')
      onRateChange()
      setEditingRate(null)
    } catch (error) {
      console.error('Error saving shipping rate:', error)
      toast.error('Failed to save shipping rate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (rate: ShippingRate) => {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/admin/shipping?product_category=${rate.product_category}&region=${rate.region}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete shipping rate')

      toast.success('Shipping rate deleted successfully')
      onRateChange()
    } catch (error) {
      console.error('Error deleting shipping rate:', error)
      toast.error('Failed to delete shipping rate')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Shipping Rates</h2>
        <Button onClick={handleAdd} disabled={isLoading || !!editingRate}>
          Add Rate
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Category</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Base Rate</TableHead>
            <TableHead className="text-right">Additional Item Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((rate) => (
            <TableRow key={`${rate.product_category}-${rate.region}`}>
              {editingRate?.product_category === rate.product_category && 
               editingRate?.region === rate.region ? (
                <>
                  <TableCell>
                    <select
                      className="w-full p-2 border rounded"
                      value={editingRate.product_category}
                      onChange={(e) => setEditingRate({
                        ...editingRate,
                        product_category: e.target.value as ProductCategory
                      })}
                    >
                      {Object.values(ProductCategory).map((category) => (
                        <option key={category} value={category}>
                          {category.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      className="w-full p-2 border rounded"
                      value={editingRate.region}
                      onChange={(e) => setEditingRate({
                        ...editingRate,
                        region: e.target.value as ShippingRegion
                      })}
                    >
                      {Object.values(ShippingRegion).map((region) => (
                        <option key={region} value={region}>
                          {region.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingRate.base_rate}
                      onChange={(e) => setEditingRate({
                        ...editingRate,
                        base_rate: parseFloat(e.target.value)
                      })}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingRate.additional_item_rate}
                      onChange={(e) => setEditingRate({
                        ...editingRate,
                        additional_item_rate: parseFloat(e.target.value)
                      })}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell>{rate.product_category.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{rate.region.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-right">
                    ${rate.base_rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${rate.additional_item_rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rate)}
                      disabled={isLoading || !!editingRate}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rate)}
                      disabled={isLoading || !!editingRate}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          {editingRate?.isNew && (
            <TableRow>
              <TableCell>
                <select
                  className="w-full p-2 border rounded"
                  value={editingRate.product_category}
                  onChange={(e) => setEditingRate({
                    ...editingRate,
                    product_category: e.target.value as ProductCategory
                  })}
                >
                  {Object.values(ProductCategory).map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <select
                  className="w-full p-2 border rounded"
                  value={editingRate.region}
                  onChange={(e) => setEditingRate({
                    ...editingRate,
                    region: e.target.value as ShippingRegion
                  })}
                >
                  {Object.values(ShippingRegion).map((region) => (
                    <option key={region} value={region}>
                      {region.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={editingRate.base_rate}
                  onChange={(e) => setEditingRate({
                    ...editingRate,
                    base_rate: parseFloat(e.target.value)
                  })}
                  className="text-right"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={editingRate.additional_item_rate}
                  onChange={(e) => setEditingRate({
                    ...editingRate,
                    additional_item_rate: parseFloat(e.target.value)
                  })}
                  className="text-right"
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
