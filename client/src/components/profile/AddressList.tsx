import { IAddress } from "@/types/address";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Edit, Trash2, Star } from "lucide-react";

interface AddressListProps {
  addresses: IAddress[];
  onEdit: (address: IAddress) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

export function AddressList({ addresses, onEdit, onDelete, onSetDefault }: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">Chưa có địa chỉ nào</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bạn chưa thêm địa chỉ nào. Hãy thêm địa chỉ để có thể đặt hàng.
        </p>
      </div>
    );
  }

  const addressesWithIndex = addresses.map((address, index) => ({
    ...address,
    index
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addressesWithIndex.map((address, index) => (
        <Card key={index} className="relative h-full flex flex-col">
          {address.isDefault && (
            <div className="absolute top-2 right-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
          )}
          <CardContent className="pt-6 flex-grow">
            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">{address.fullName}</p>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                </div>
              </div>
              <p className="text-sm break-words">
                {address.street && `${address.street}, `}
                {address.ward && `${address.ward}, `}
                {address.district && `${address.district}, `}
                {address.city}
              </p>
              {address.note && (
                <p className="text-sm text-muted-foreground">{address.note}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(index.toString())}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa
            </Button>
            {!address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(index.toString())}
              >
                <Star className="h-4 w-4 mr-1" />
                Mặc định
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 