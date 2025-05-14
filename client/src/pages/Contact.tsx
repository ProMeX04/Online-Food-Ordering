import { useEffect } from "react";
import { CartoonBorder } from "@/components/ui/CartoonBorder";
import ContactSection from "@/components/contact/ContactSection";

const Contact = () => {
  useEffect(() => {
    document.title = "Liên hệ | ViệtFood";
  }, []);
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-baloo font-bold text-4xl md:text-5xl text-neutral mb-4">
            Liên Hệ <span className="text-primary">Với Chúng Tôi</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg mb-8">
            Chúng tôi luôn sẵn sàng lắng nghe ý kiến, giải đáp thắc mắc và tiếp nhận đặt hàng của bạn.
            Đừng ngần ngại liên hệ với ViệtFood ngay hôm nay!
          </p>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <CartoonBorder className="p-4 overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674198386!2d106.69901181538801!3d10.775892892322648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4670702e31%3A0xa5777fb3a5bb0bc7!2sNguy%E1%BB%85n%20Hu%E1%BB%87%20Walking%20Street!5e0!3m2!1sen!2s!4v1595914383909!5m2!1sen!2s" 
              width="100%" 
              height="450" 
              frameBorder="0" 
              style={{border: 0}} 
              allowFullScreen 
              aria-hidden="false" 
              title="Vị trí ViệtFood"
            ></iframe>
          </CartoonBorder>
        </div>
      </section>
      
      {/* Contact Form and Info */}
      <ContactSection />
      
      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-baloo font-bold text-3xl md:text-4xl text-neutral mb-2">
              Câu Hỏi <span className="text-primary">Thường Gặp</span>
            </h2>
            <p className="text-neutral/80">Những thắc mắc phổ biến của khách hàng</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                Thời gian giao hàng là bao lâu?
              </h3>
              <p className="text-neutral/80">
                Thời gian giao hàng của chúng tôi thường từ 20-30 phút tùy thuộc vào khoảng cách và điều kiện giao thông. 
                Quý khách sẽ được thông báo thời gian dự kiến khi đặt hàng.
              </p>
            </CartoonBorder>
            
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                Các phương thức thanh toán?
              </h3>
              <p className="text-neutral/80">
                Chúng tôi chấp nhận thanh toán tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng, 
                và thanh toán qua thẻ tín dụng/ghi nợ qua cổng thanh toán an toàn.
              </p>
            </CartoonBorder>
            
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                Có phí giao hàng không?
              </h3>
              <p className="text-neutral/80">
                Phí giao hàng áp dụng dựa trên khoảng cách. Với các đơn hàng trên 200.000đ trong bán kính 3km, 
                bạn sẽ được miễn phí giao hàng.
              </p>
            </CartoonBorder>
            
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                Làm thế nào để theo dõi đơn hàng?
              </h3>
              <p className="text-neutral/80">
                Sau khi đặt hàng thành công, bạn sẽ nhận được mã đơn hàng qua SMS hoặc email. 
                Bạn có thể dùng mã này để kiểm tra trạng thái đơn hàng trên website hoặc ứng dụng của chúng tôi.
              </p>
            </CartoonBorder>
            
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                Chính sách đổi/trả món ăn?
              </h3>
              <p className="text-neutral/80">
                Nếu bạn không hài lòng với món ăn nhận được (không đúng mô tả, chất lượng kém), 
                vui lòng liên hệ chúng tôi trong vòng 30 phút sau khi nhận hàng để được hỗ trợ.
              </p>
            </CartoonBorder>
            
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3">
                <i className="fas fa-question-circle text-primary mr-2"></i>
                Làm thế nào để sử dụng mã giảm giá?
              </h3>
              <p className="text-neutral/80">
                Khi thanh toán, bạn có thể nhập mã giảm giá vào ô "Mã khuyến mãi" trước khi hoàn tất đơn hàng. 
                Mỗi mã chỉ có thể sử dụng một lần và tuân theo điều kiện áp dụng.
              </p>
            </CartoonBorder>
          </div>
        </div>
      </section>
      
      {/* Branches Section */}
      <section className="py-12 bg-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-baloo font-bold text-3xl md:text-4xl text-neutral mb-2">
              Hệ Thống <span className="text-primary">Chi Nhánh</span>
            </h2>
            <p className="text-neutral/80">Các địa điểm nhà hàng của chúng tôi</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3 text-primary">TP. Hồ Chí Minh</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Chi nhánh 1:</p>
                    <p className="text-neutral/80">123 Nguyễn Huệ, Quận 1</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Chi nhánh 2:</p>
                    <p className="text-neutral/80">456 Lê Văn Sỹ, Quận 3</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-phone-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Điện thoại:</p>
                    <p className="text-neutral/80">028 1234 5678</p>
                  </div>
                </div>
              </div>
            </CartoonBorder>
            
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3 text-primary">Hà Nội</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Chi nhánh 1:</p>
                    <p className="text-neutral/80">78 Lý Thường Kiệt, Hoàn Kiếm</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Chi nhánh 2:</p>
                    <p className="text-neutral/80">92 Trần Duy Hưng, Cầu Giấy</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-phone-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Điện thoại:</p>
                    <p className="text-neutral/80">024 9876 5432</p>
                  </div>
                </div>
              </div>
            </CartoonBorder>
            
            <CartoonBorder className="p-6">
              <h3 className="font-baloo font-bold text-xl mb-3 text-primary">Đà Nẵng</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Chi nhánh 1:</p>
                    <p className="text-neutral/80">35 Bạch Đằng, Hải Châu</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-phone-alt text-accent mt-1 mr-3"></i>
                  <div>
                    <p className="font-medium">Điện thoại:</p>
                    <p className="text-neutral/80">0236 3456 789</p>
                  </div>
                </div>
              </div>
            </CartoonBorder>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
