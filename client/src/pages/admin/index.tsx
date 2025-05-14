import AdminLayout from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const salesData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Doanh thu',
        data: [12000000, 19000000, 15000000, 25000000, 22000000, 30000000],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Dữ liệu mẫu cho biểu đồ tròn
  const categoryData = {
    labels: ['Món chính', 'Món phụ', 'Đồ uống', 'Tráng miệng'],
    datasets: [
      {
        label: 'Số lượng món',
        data: [35, 20, 15, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tổng quan</h1>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-primary/20 p-3 rounded-full mr-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đơn hàng hôm nay</p>
                <h3 className="text-2xl font-bold">28</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-green-500/20 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doanh thu hôm nay</p>
                <h3 className="text-2xl font-bold">5.200.000đ</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Khách hàng</p>
                <h3 className="text-2xl font-bold">1,205</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="bg-amber-500/20 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sản phẩm</p>
                <h3 className="text-2xl font-bold">80</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <Line 
                data={salesData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Món ăn theo danh mục</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div style={{ width: '100%', maxWidth: '250px' }}>
                <Doughnut data={categoryData} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Đơn hàng gần đây */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Mã đơn</th>
                    <th className="text-left p-3">Khách hàng</th>
                    <th className="text-left p-3">Ngày đặt</th>
                    <th className="text-left p-3">Trạng thái</th>
                    <th className="text-right p-3">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">#ORD-123456</td>
                    <td className="p-3">Nguyễn Văn A</td>
                    <td className="p-3">12/07/2023</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Đã giao</span>
                    </td>
                    <td className="p-3 text-right">350.000đ</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">#ORD-123457</td>
                    <td className="p-3">Trần Thị B</td>
                    <td className="p-3">12/07/2023</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Đang giao</span>
                    </td>
                    <td className="p-3 text-right">520.000đ</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">#ORD-123458</td>
                    <td className="p-3">Lê Văn C</td>
                    <td className="p-3">12/07/2023</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">Đang chuẩn bị</span>
                    </td>
                    <td className="p-3 text-right">180.000đ</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">#ORD-123459</td>
                    <td className="p-3">Phạm Thị D</td>
                    <td className="p-3">12/07/2023</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Đã giao</span>
                    </td>
                    <td className="p-3 text-right">420.000đ</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="p-3">#ORD-123460</td>
                    <td className="p-3">Đặng Văn E</td>
                    <td className="p-3">12/07/2023</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Đã hủy</span>
                    </td>
                    <td className="p-3 text-right">250.000đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 