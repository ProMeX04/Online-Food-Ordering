import { useState, useEffect, useCallback } from "react"
import { IAddress, IAddressUpdate } from "@/types/address"
import { useAuth } from "@/hooks/use-auth"
import { del, get, post, put } from "@/lib/axiosClient"
export function useAddress() {
  const [addresses, setAddresses] = useState<IAddress[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const fetchAddresses = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const response = await get('/user-profile/addresses') as any
      const addressesData = response?.data || response || []
      setAddresses(addressesData)
    } catch (err) {
      console.error("Error fetching addresses:", err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user, fetchAddresses])

  const addAddress = async (address: IAddress) => {
    try {
      setIsLoading(true)
      await post('/user-profile/addresses', address)
      await fetchAddresses()
      return true
    } catch (err) {
      console.error("Error adding address:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateAddress = async ({ addressIndex, address }: IAddressUpdate) => {
    try {
      setIsLoading(true)
      await put(`/user-profile/addresses/${addressIndex}`, address)
      await fetchAddresses()
      return true
    } catch (err) {
      console.error("Error updating address:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAddress = async (addressIndex: number) => {
    try {
      setIsLoading(true)
      await del(`/user-profile/addresses/${addressIndex}`)
      await fetchAddresses()
      return true
    } catch (err) {
      console.error("Error deleting address:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const setDefaultAddress = async (addressIndex: number) => {
    try {
      setIsLoading(true)
      const address = addresses[addressIndex]
      if (!address) throw new Error("Address not found")

      await Promise.all(
        addresses.map(async (addr, index) => {
          if (addr.isDefault && index !== addressIndex) {
            await put(`/user-profile/addresses/${index}`, { ...addr, isDefault: false })
          }
          return addr
        })
      )

      await put(`/user-profile/addresses/${addressIndex}`, { ...address, isDefault: true })
      await fetchAddresses()
      return true
    } catch (err) {
      console.error("Error setting default address:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses
  }
} 