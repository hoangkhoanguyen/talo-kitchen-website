-- Seed nội dung tiếng Việt vào schema "prod_v2". Chỉ điền ô vi đang trống, không ghi đè.
-- 402 chuỗi. Chạy trong 1 transaction; kiểm tra rồi COMMIT.
BEGIN;

-- product_translations
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (1, 'vi', 'Croque Nấm Teriyaki với Trứng Chần', 'Lớp croque vàng giòn xếp tầng cùng nấm áp chảo sốt teriyaki mềm ngọt, sốt béchamel béo ngậy, phô mai tan chảy và một quả trứng chần mịn như lụa. Mỗi miếng cắn là sự hòa quyện của vị ngọt, mặn và béo, làm nổi bật vị umami đậm đà của nấm.', 'Croque giòn rụm phủ nấm teriyaki béo mịn.', 'Sốt béchamel tự làm x Sourdough x Nấm địa phương x Trứng chần x Phô mai x Sốt Teriyaki')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (2, 'vi', 'Croque Gà Confit Mắc Mật', 'Sự kết hợp độc đáo giữa kỹ thuật Pháp cổ điển và hương vị vùng cao Hà Giang. Croque Gà Confit Mắc Mật có phần đùi gà mềm, được nấu chậm trong chính nước của nó theo kỹ thuật confit truyền thống của Pháp. Thấm đẫm hương thơm thảo mộc của lá mắc mật địa phương, phần thịt gà mọng nước được xếp giữa lớp bánh mì thủ công nướng giòn, phủ phô mai tan chảy béo ngậy và nướng đến khi vàng đẹp. Một món tinh tế mà ấm áp, dành cho một buổi tối trọn vẹn.', 'Bánh sandwich nướng lò với gà confit kiểu Pháp thấm hương lá mắc mật địa phương, phủ phô mai tan chảy.', 'Béchamel x Sourdough x Nấm địa phương x Gà confit x Phô mai')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (3, 'vi', 'Croque Monsieur', 'Những lát bánh mì dày nướng giòn ôm lấy lớp giăm bông mềm và phô mai chảy, phủ sốt béchamel mịn nướng đến vàng óng. Đậm đà, ấm lòng, giòn rụm bên ngoài nhưng mềm và tan chảy bên trong.', 'Croque kiểu Pháp cổ điển với phô mai tan chảy và bánh mì nướng bơ thơm.', 'Sourdough x Giăm bông x Béchamel x Phô mai x Salad')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (4, 'vi', 'Mì Ý Hải Sản | Premium', 'Mì Ý với tôm, trai, đậu Hà Lan non và sốt bisque nhím biển', 'Mì Ý với tôm, trai, đậu Hà Lan non và sốt bisque nhím biển', 'Mì Ý với tôm, trai, đậu Hà Lan non và sốt bisque nhím biển')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (5, 'vi', 'Mì Ý Nấm', 'Nấm địa phương được áp chảo để dậy lên vị ngọt tự nhiên và hương đất đặc trưng, sau đó trộn cùng mì Ý áo sốt rau củ nâu cô đặc nấu chậm. Nước dùng mang đến tầng vị umami sâu, cân bằng bởi chút chua nhẹ giúp món ăn luôn tươi sáng. Hoàn thiện với phô mai parmesan béo mịn cho vị mặn béo tròn đầy — ấm lòng, thơm và thỏa mãn mà không hề ngấy.', 'Sốt umami rau củ cô đặc ôm lấy nấm đậm hương đất, nâng vị bằng chút chua nhẹ và parmesan.', 'Nấm địa phương x Sốt rau củ umami cô đặc x Phô mai Parmesan')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (6, 'vi', 'Mì Ý Bolognese', 'Mì Ý Bolognese mang đến một biến tấu riêng cho món Ý kinh điển. Thịt heo bằm đậm đà hòa quyện cùng sốt cà chua tự làm, được ninh chậm nhiều giờ trong nước hầm xương cô đặc. Quá trình này tạo nên lớp sốt sánh mịn, đậm vị, hoàn thiện bằng lớp phô mai parmesan bào béo ngậy.', 'Thịt heo bằm đậm đà ninh trong nền sốt cà chua sánh đặc, nấu chậm.', 'Thịt heo bằm x Sốt cà chua x Phô mai Parmesan x Mì Ý')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (7, 'vi', 'Croque Hạt & Mật Ong', 'Sự cân bằng thú vị giữa béo mịn, giòn rụm và ngọt ngào. Croque Hạt & Mật Ong gồm bánh sourdough thủ công giòn phủ phô mai tan chảy sủi bọt, rắc đầy hạt rang và rưới mật ong ngọt.', 'Sourdough giòn phủ phô mai tan chảy nóng hổi, hạt rang giòn và mật ong địa phương ngọt thơm.', 'Sourdough x Béchamel x Hạt x Mật ong x Hạt mix x Trái cây')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (8, 'vi', 'Croque Thăn Bò Flank', 'Croque Thăn Bò Flank sẽ chiếm trọn trái tim bạn ngay từ cái nhìn đầu tiên: thăn bò flank áp chảo mềm, mọng nước chất đầy trên lát sourdough giòn, ngập trong sốt bò cô đặc đậm đà và phủ lớp phô mai nướng lò sủi bọt.', 'Sourdough nướng lò xếp thăn bò flank áp chảo mềm, dùng cùng sốt bò đậm đà và phủ phô mai tan chảy.', 'Sourdough x Béchamel x Thăn bò flank x Phô mai x Sốt bò x Salad')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (9, 'vi', 'Croque Madam', 'Những lát bánh mì dày nướng giòn ôm lấy lớp giăm bông mềm và phô mai chảy, phủ sốt béchamel mịn như nhung và nướng vàng óng. Trên cùng là trứng ốp la lòng đào, lòng đỏ béo ngậy chảy ra khi bạn nhẹ nhàng cắt xuống. Giòn bên ngoài, mềm và tan chảy bên trong.', 'Bánh mì giăm bông phô mai giòn phủ béchamel béo mịn và trứng ốp la lòng đào.', 'Sourdough x Giăm bông x Béchamel x Phô mai x Trứng ốp la x Salad')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (10, 'vi', 'Salad', 'Sự kết hợp tươi mát của rau xanh vườn tươi và trái cây theo mùa, trộn cùng sốt mè béo bùi. Nhẹ nhàng, rực rỡ và đầy hương vị tự nhiên - lựa chọn hoàn hảo cho một bữa ăn lành mạnh và thỏa mãn.', 'Rau xanh vườn giòn tươi, trái cây theo mùa, cùng sốt mè béo bùi.', 'Salad rau vườn tươi x Trái cây tươi x Sốt mù tạt')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (11, 'vi', 'Bò Striploin và Khoai Tây Nghiền Truffle', 'Khoai tây chiên kiểu Pháp vàng giòn, nêm nếm vừa vặn và chiên đến độ xốp mềm hoàn hảo. Món ăn kèm kinh điển hợp với mọi món chính, mang lại cảm giác ấm lòng và thỏa mãn trong từng miếng.', 'Giòn bên ngoài, xốp mềm bên trong — món ăn kèm hoàn hảo.', 'Khoai tây')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (12, 'vi', 'Chocolate', 'Đắm chìm trong sự ấm áp tuyệt đối của chocolate. Bột cacao nguyên chất thơm nồng được đánh cùng sốt chocolate tự làm đậm đà, mượt như lụa, rồi hòa quyện với sữa tươi. Cân bằng hoàn hảo giữa vị đắng sâu của cacao và vị ngọt béo mịn, mang đến hậu vị êm mượt — ngon dù dùng nóng hay đá.', 'Sự hòa quyện đậm đà, ấm áp giữa cacao nguyên chất, sốt chocolate cao cấp và sữa tươi béo mịn.', 'Cacao - Sốt Chocolate x Sữa')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (13, 'vi', 'Chocolate Bạc Hà', 'Thức uống cân bằng hoàn hảo giữa chocolate đậm đà mượt như nhung và làn gió bạc hà the mát sảng khoái. Cacao nguyên chất và sốt chocolate đậm đà được hòa quyện mượt mà cùng sữa tươi, tạo nên kết cấu béo mịn, theo sau là hậu vị mát lạnh, trong trẻo đọng lại thật lâu.', 'Sự cân bằng hoàn hảo giữa chocolate đậm đà mượt mà và bạc hà the mát sảng khoái.', 'Sốt Chocolate x Bột cacao x Sữa x Siro bạc hà, Kitkat')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (14, 'vi', 'Cà phê đen', 'Cà phê của chúng tôi được làm từ hạt nguyên chất do chính quán chọn lựa thủ công. Chúng tôi rang theo phong cách riêng để giữ trọn hương vị đặc trưng — vị đắng nhẹ nhàng ở đầu lưỡi và hậu vị ngọt tự nhiên, êm mượt.', 'Cà phê rang Việt Nam.', 'Cà phê rang Việt Nam')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (15, 'vi', 'Cà phê sữa', 'Cà phê của chúng tôi được pha từ hạt nguyên chất, do quán tỉ mỉ chọn lựa thủ công. Mỗi mẻ được rang theo công thức riêng, tạo nên hương vị đặc trưng bắt đầu bằng vị đắng tinh tế và kết thúc với hậu vị ngọt nhẹ tự nhiên.', 'Cà phê rang Việt Nam với sữa.', 'Cà phê rang Việt Nam với sữa')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (16, 'vi', 'Cà phê trắng pha phin', 'Một thức uống hoài niệm dành cho những ai thích cà phê dịu nhẹ. Sữa đặc đậm đà và sữa tươi mượt mà tạo nên nền ngọt béo, được cân bằng hoàn hảo bởi chút cà phê phin Việt Nam pha chậm, đậm đà rót lên trên. Thơm nồng, mượt như lụa và dễ uống vô cùng.', 'Thức uống ngọt béo quen thuộc của người Việt với sữa nóng đánh bông và sữa đặc, rưới nhẹ cà phê phin đậm đà.', 'Cà phê x Sữa')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (17, 'vi', 'Nước ép dứa', 'Chanh Soda tươi là sự kết hợp hoàn hảo giữa chanh tươi và soda sủi bọt mát lạnh.', 'Chanh Soda tươi', 'Nước ép dứa')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (18, 'vi', 'Nước cam ép', 'Cam tươi – vị mọng nước bung tỏa trong từng ngụm!', 'Cam mọng nước', 'Cam tươi')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (19, 'vi', 'Croque Bolognese với Trứng Chần', 'Một chiếc croque ấm áp xoay quanh sốt Bolognese nấu chậm của chúng tôi, xếp cùng sốt béchamel béo mịn và phô mai tan chảy trên lát sourdough giòn. Trứng chần mềm thêm vào độ béo ngậy, mang đến miếng ăn ấm áp, thỏa mãn từ đầu đến cuối.', 'Croque xoay quanh sốt Bolognese nấu chậm – đậm đà, ấm áp và đáng để thưởng thức thật chậm rãi.', 'Sốt Bolognese tự làm x Sourdough x Béchamel x Trứng chần x Phô mai')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (20, 'vi', 'Camembert Nướng với Hạt & Quả Mọng', 'Món chiều lòng cả bàn cho một buổi tối ấm cúng! Camembert Nướng với Hạt & Quả Mọng gồm nguyên một khối Camembert nướng đến khi nóng, béo ngậy và chảy mềm bên trong. Phủ lên trên là hỗn hợp quả mọng chua ngọt rực rỡ, hạt rang giòn và chút mật ong ngọt. Chấm một lát sourdough thủ công giòn vào lớp phô mai nóng chảy để có một miếng ăn khó quên — ngon nhất khi dùng cùng một ly rượu vang!', 'Phô mai Camembert nướng nóng phủ hạt rang giòn và quả mọng chua ngọt, dùng kèm sourdough giòn.', 'Phô mai Camembert x Mật ong x Trái cây x Sourdough x Hạt mix')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (21, 'vi', 'Brie Nhồi Truffle & Mascarpone', 'Sự kết hợp đầy cuốn hút giữa phô mai Brie Pháp béo ngậy, được nhồi tinh tế với nhân mascarpone truffle mịn màng và thơm nồng. Cân bằng bởi vị ngọt tự nhiên của trái cây tươi theo mùa, nho khô dai ngọt và chút mật ong địa phương, món ăn được dùng cùng bánh mì sourdough nóng giòn cho miếng ăn mặn ngọt đáng nhớ.', 'Brie béo mịn nhồi mascarpone truffle đậm đà, dùng với trái cây tươi, nho khô, mật ong địa phương và sourdough nướng nóng.', 'Phô mai Brie x Mascarpone truffle x Bánh mì sourdough x Mật ong địa phương x Trái cây tươi x Nho khô')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (22, 'vi', 'Cold Cut Board', 'Khay kết hợp hoàn hảo cho những đêm thưởng thức rượu vang hay bia thủ công! Cold Cut & Cheese Platter của chúng tôi gồm tuyển chọn charcuterie cao cấp (chorizo cay, salami đậm vị, giăm bông béo ngậy) cùng phô mai Brie béo mịn và phô mai xông khói dai thơm. Cân bằng với dưa chuột ngâm cornichon chua nhẹ, ô liu xanh, hạnh nhân giòn và trái cây sấy ngọt, dùng kèm bánh mì nướng giòn.
(Phù hợp cho 2 – 3 khách cùng chia sẻ).', 'Khay thịt nguội & phô mai tổng hợp dùng kèm ô liu, đồ chua, hạt, trái cây sấy và bánh mì nướng', 'Khay thịt nguội & phô mai tổng hợp (Chorizo x Salami x Salchichon x Brie x Camembert x Phô mai xông khói) dùng kèm mật ong và bánh mì nướng')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (23, 'vi', 'Nước ép táo dứa', 'Trái cây theo mùa ép tươi', 'Trái cây theo mùa ép tươi', 'Trái cây theo mùa ép tươi')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, sub_description, allergen_info)
VALUES (24, 'vi', 'Illuminate | Signature Special', 'Lady Trieu Gin Da Lat FlowerBomb x Bols Strawberry x Plum bitter x Bọt Espuma x Siro hoa hồng', 'Lady Trieu Gin Da Lat FlowerBomb x Bols Strawberry x Plum bitter x Bọt Espuma x Siro hoa hồng')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (25, 'vi', 'Tamarind Tropical', 'Tamarind Tropical là một cuộc phiêu lưu của các giác quan trong ly. Mở đầu bằng vị chua quen thuộc đậm đà của me chín, hòa quyện mượt mà với vị ngọt nhiệt đới đậm đà. Khi hương vị lắng xuống, phần kết hùng hồn trỗi dậy: một đợt sóng bùng nổ của trái cây nhiệt đới tươi sáng và vị chua giòn, điểm xuyết chút cay nhẹ làm tê đầu lưỡi. Phục vụ lạnh buốt, hương vị sống động này không chỉ giải khát mà còn làm sạch vị giác — là lựa chọn hoàn hảo để nâng tầm mọi bữa ăn hay món ăn nhẹ.', 'Sự kết hợp nhiệt đới sống động, bắt đầu bằng vị me chua và kết thúc với đợt bùng nổ trái cây nhiệt đới, vị chua giòn và chút cay nhẹ đánh thức vị giác.', 'Light Rhum x Mứt me x Mận x Nước ép dứa x Nước cốt chanh')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (26, 'vi', 'Candy Fizz', 'Một khoảng lặng ngọt ngào, nhẹ nhàng giữa ngày bận rộn.
Candy Fizz hòa quyện vị ngọt dịu cùng những bọt khí li ti tan chậm trên đầu lưỡi — như một cái ôm êm ái, an ủi tâm trạng. Không quá mạnh mẽ, chỉ vừa đủ để xoa dịu tinh thần và mang đến phút giây thư thái.', 'Một chút ngọt, một chút vui.
Ngọt ngào, tinh nghịch và như kẹo — loại thức uống đơn giản khiến bạn thấy vui hơn.', 'Gin Bulldog x Rượu chuối x Siro kẹo cao su x Nước cốt chanh')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, sub_description, allergen_info)
VALUES (27, 'vi', 'Negroni', 'Gin x Campari x Sweet Vermouth', 'Gin x Campari x Sweet Vermouth')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, sub_description, allergen_info)
VALUES (28, 'vi', 'Black Russian', 'Vodka x Kailua', 'Vodka x Kailua')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (29, 'vi', 'Cosmopolitan', 'Cosmopolitan là biểu tượng của sự thanh lịch và hương vị rực rỡ. Xây dựng trên nền Vodka cao cấp tinh khiết, loại cocktail quyến rũ này kết hợp vị cam phức hợp đậm đà của Cointreau với vị chua tươi của nước ép nam việt quất và chanh tươi. Cân bằng bằng chút siro đường, mỗi ngụm lạnh đều đạt sự hài hòa hoàn hảo giữa vị chua sáng, vị trái cây dịu nhẹ và chút nồng của rượu. Nổi bật với sắc hồng phớt đặc trưng, đây là trải nghiệm uống sảng khoái, giòn tan và tinh tế.', 'Một kiệt tác hiện đại sang trọng, kết hợp Vodka mượt mà, Cointreau vị cam, nam việt quất chua dịu và chanh tươi giòn, tạo nên ly cocktail chua ngọt phong cách với sắc hồng rực rỡ.', 'Vodka x Cointreau x Nước ép nam việt quất x Nước cốt chanh x Siro đường')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (30, 'vi', 'Trà xoài chanh dây', 'Hạt chanh dây chua nhẹ và xoài chín mọng nước hòa quyện trong ly trà lạnh buốt, mang đến cú bùng nổ nhiệt đới tức thì.', 'Trà xanh thơm ngát được ướp nhẹ nhàng hương hoa nhài tự nhiên cho vị thanh mát, dịu hương hoa.', 'Xoài x Chanh dây - Trà')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (31, 'vi', 'Trà dâu Sunburst', 'Một ly nắng rực rỡ trong từng ngụm. Trà mới pha được hòa cùng mứt dâu đậm đà vị mật ong và xếp lớp những lát cam tươi mọng nước. Vị ngọt tự nhiên của dâu chín hòa hợp tuyệt đẹp với hương cam chanh tươi sáng, mang đến sự kết hợp mát lạnh, hấp dẫn, đánh thức mọi giác quan và làm bừng sáng ngày của bạn.', 'Trà đá rực rỡ thấm vị mứt dâu ngọt và những lát cam chua thanh, bùng nổ hương vị nhiệt đới tươi sáng.', 'Mứt dâu x Cam navel x Trà')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (32, 'vi', 'Trà xoài Yakult', 'Thức uống nhiệt đới khó cưỡng, tràn đầy hương vị trái cây tươi. Trà pha cao cấp gặp mứt xoài ngọt đậm và vị chua béo mịn hấp dẫn của sữa chua lên men. Hoàn thiện với lớp xoài tươi cắt hạt lựu phong phú, mỗi ngụm mang đến sự tương phản thú vị giữa ngọt, chua và béo mịn, giải khát tức thì.', 'Trà đá sảng khoái xếp lớp mứt xoài ngọt, sữa chua lên men chua nhẹ, phủ xoài tươi mọng nước.', 'Xoài xay nhuyễn x Yakult x Xoài tươi x Trà')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (33, 'vi', 'Trà kiwi lá dứa', 'Sự pha trộn nhiệt đới độc đáo, hòa hợp giữa vị trái cây đậm đà và hương thảo mộc dễ chịu. Trà xanh cao cấp kết hợp vị ngọt chua của kiwi, thấm hương lá dứa tươi thơm bùi tinh tế. Giòn mát, thanh khiết và cân bằng hoàn hảo giữa vị ngọt, chua và hương hoa — một ngụm sảng khoái bất ngờ cho mọi thời điểm trong ngày.', 'Sự kết hợp sảng khoái của trà thơm thấm mứt kiwi chua ngọt và siro lá dứa thơm nồng.', 'Mứt kiwi x Lá dứa x Trà')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (34, 'vi', 'Trà gừng', 'Được làm từ gừng tươi thái lát, Trà gừng mang đến sự cân bằng hoàn hảo giữa vị cay nồng và hương thơm đậm đà. Thưởng thức nóng để cảm nhận sự ấm áp dễ chịu, giúp tiêu hóa và xua tan cái lạnh, hoặc dùng cùng đá để có cảm giác tươi mới, sảng khoái làm bừng sáng buổi chiều của bạn. Dù nóng hổi hay lạnh mát — nguyên bản hay thêm mật ong và chanh — đây là thức uống tự nhiên tuyệt vời cho mọi mùa.', 'Thức uống đa năng dùng nóng hoặc lạnh, với vị cay nồng của gừng tươi giúp sưởi ấm hoặc làm tươi mới ngày của bạn, đồng thời hỗ trợ tiêu hóa.', 'Trà x Gừng')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (35, 'vi', 'Martini', 'Classic Martini là hiện thân của sự tinh tế và thuần khiết. Được pha từ nền rượu bạn chọn — Gin thơm thảo mộc giòn tan hoặc Vodka siêu mượt — khuấy cùng chút Dry Vermouth. Lược bỏ mọi điểm xuyết rườm rà, thức uống mang hương vị khô và mạnh một cách không khoan nhượng. Mỗi ngụm lạnh buốt đều đậm chất rượu sắc nét, cân bằng bởi hương thảo mộc tinh tế và hậu vị sạch, thanh lịch. Dùng lạnh kèm ô liu hoặc vỏ chanh xoắn, đây là thức uống tối thượng dành cho những người sành rượu thực thụ.', 'Một cocktail kinh điển bất hủ, đậm chất rượu, kết hợp Gin hoặc Vodka cao cấp với Dry Vermouth cho hậu vị khô, mạnh và trong vắt.', 'Vodka hoặc Gin x Dry Vermouth')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (36, 'vi', 'Whiskey Sour', 'Whisky Sour là kiệt tác của kết cấu và sự cân bằng. Xây dựng trên nền Bourbon Whiskey mạnh mẽ, thơm mùi gỗ sồi và vani, được đánh thức bởi vị chua sắc của nước cốt chanh tươi và làm tròn vị bằng chút siro đường. Được lắc khô cùng lòng trắng trứng để tạo lớp bọt mịn sang trọng, mượt như lụa, mỗi ngụm lướt nhẹ nhàng trên đầu lưỡi. Hoàn thiện bằng một giọt Angostura Bitters tinh tế trên cùng, thức uống hòa quyện hơi ấm của rượu, vị chua giòn, độ béo mịn và hậu vị thảo mộc thơm.', 'Cocktail kinh điển bất hủ hòa quyện Bourbon whiskey đậm đà với vị chua tươi của chanh, ngọt vừa vặn, phủ lớp bọt lòng trắng trứng mịn như nhung và hậu vị bitters thơm.', 'Bourbon Whiskey x Nước cốt chanh x Siro đường x Angostura bitter x Lòng trắng trứng')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (37, 'vi', 'Bee''s Knees', 'Bee’s Knees là một cocktail cổ điển duyên dáng và tươi sáng, làm nổi bật sự hài hòa giữa hương thảo mộc và vị ngọt tự nhiên. Được pha từ nền Gin giòn tan, thức uống mở đầu bằng làn chanh tươi bùng nổ, đánh thức vị giác ngay tức thì. Vị chua giòn được làm tròn mượt mà bởi mật ong đậm đà và chút siro đường nhẹ, thêm chiều sâu và hậu vị mượt như lụa. Được lắc kỹ và dùng lạnh buốt, thức uống mang đến sự cân bằng sảng khoái giữa vị cam chanh ngọt và nét thanh lịch thảo mộc — đúng nghĩa "the bee’s knees".', 'Cocktail kinh điển thời Cấm rượu, hòa quyện Gin thơm với nước cốt chanh giòn, được làm dịu bởi hơi ấm hương hoa của siro mật ong tự nhiên.', 'Gin x Nước cốt chanh x Mật ong x Siro đường')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (38, 'vi', 'Margarita', 'Tequila Martini này là một biến tấu hiện đại, rực rỡ trên công thức cổ điển. Được pha từ Tequila agave mượt mà và Cointreau đậm đà, cân bằng hoàn hảo bởi vị chua sắc của nước cốt chanh tươi và chút siro đường. Trải nghiệm bắt đầu từ viền ly với lớp muối biển mịn, cắt đi vị chua của cam chanh và làm nổi bật vị ngọt agave tự nhiên. Dùng lạnh buốt, mỗi ngụm mang đến sự tương phản nổi bật giữa vị chua giòn, vị ngọt cam tinh tế và hậu vị mặn ấm áp khiến bạn muốn thưởng thức thêm.', 'Tequila Martini rực rỡ hòa quyện hương agave đậm đà với Cointreau cam ngọt và chanh giòn, nâng tầm bằng viền muối tinh tế cho hậu vị chua-ngọt-mặn đầy cuốn hút.', 'Tequila x Cointreau x Nước cốt chanh x Siro đường')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (39, 'vi', 'Gimlet', 'Gimlet là tiêu chuẩn vàng của sự thanh lịch tối giản. Xây dựng trên nền Gin cao cấp giòn tan, thơm thảo mộc, thức uống dựa vào vị chua sắc, tươi sáng của nước cốt chanh vắt tươi, được làm tròn tinh tế bằng siro đường. Được lắc cùng đá đến khi lạnh buốt, mỗi ngụm mở đầu bằng vị chanh tươi sáng, tiếp nối mượt mà là hương thông và thảo mộc phức hợp, để lại hậu vị sạch, sắc nét và vô cùng sảng khoái. Đơn giản, bất hủ và cân bằng hoàn hảo.', 'Cocktail cổ điển giòn tan, thơm thảo mộc, cân bằng chính xác giữa Gin thơm và vị chua tươi của chanh', 'Gin x Nước cốt chanh x Siro đường')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (40, 'vi', 'Clover Club', 'Có nguồn gốc từ thời tiền Cấm rượu, Clover Club là biểu tượng tối thượng của sự tinh tế bất hủ. Với nền Gin khô, thơm, thức uống hòa quyện mượt mà cùng siro mâm xôi ngọt ngào và Grenadine đậm đà, tạo nên sắc đỏ ruby rực rỡ và lõi chua ngọt cân bằng hoàn hảo. Nước cốt chanh tươi thêm nét chua cam chanh giòn, còn việc lắc khô cùng lòng trắng trứng tạo nên lớp bọt mịn như nhung sang trọng. Mỗi ngụm mang đến sự cân bằng tinh tế giữa hơi ấm thảo mộc, hương quả mọng tươi sáng và độ béo mịn đọng lại duyên dáng trên đầu lưỡi.', 'Cocktail cổ điển thanh lịch kết hợp Gin thơm giòn với hương mâm xôi và lựu chua ngọt, lắc cùng lòng trắng trứng cho lớp bọt hồng mềm như mây.', 'Gin x Siro mâm xôi x Siro Grenadine x Nước cốt chanh x Lòng trắng trứng')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (41, 'vi', 'Chanh Soda', 'Chanh x Soda', 'Chanh x Soda', 'Chanh x Soda')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (42, 'vi', 'Bespoke', 'Pha chế theo khẩu vị của bạn.', 'Pha chế theo khẩu vị của bạn.', 'Pha chế theo khẩu vị của bạn.')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (43, 'vi', 'Bulldog | Shot', 'London Dry Gin · 40% ABV · 45ml', 'London Dry Gin · 40% ABV · 45ml', 'London Dry Gin · 40% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (44, 'vi', 'Jagermeister | Shot', 'Rượu mùi thảo mộc · 35% ABV · 45ml', 'Rượu mùi thảo mộc · 35% ABV · 45ml', 'Rượu mùi thảo mộc · 35% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (45, 'vi', 'Jose Cuervo Especial | Shot', 'Tequila · 38% ABV · 45ml', 'Tequila · 38% ABV · 45ml', 'Tequila · 38% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (46, 'vi', 'Sky Vodka | Shot', 'Vodka · 40% ABV · 45ml', 'Vodka · 40% ABV · 45ml', 'Vodka · 40% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (47, 'vi', 'Vsop | Shot', 'Brandy · 40% ABV · 45ml', 'Brandy · 40% ABV · 45ml', 'Brandy · 40% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (48, 'vi', 'Coca Light / Zero', 'Coca-Cola không đường', 'Coca-Cola không đường', 'Coca-Cola không đường')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (49, 'vi', 'Aquafina', 'Nước đóng chai', 'Nước đóng chai', 'Nước đóng chai')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (50, 'vi', 'Blanco Supremo | Shot', 'Rum · 38% ABV · 45ml', 'Rum · 38% ABV · 45ml', 'Rum · 38% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (51, 'vi', 'Wild Turkey | Shot', 'Whiskey · 40.5% ABV · 45ml', 'Whiskey · 40.5% ABV · 45ml', 'Whiskey · 40.5% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (52, 'vi', 'Bushmills | Shot', 'Whiskey · 40% ABV · 45ml', 'Whiskey · 40% ABV · 45ml', 'Whisky · 40% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (53, 'vi', 'Plum Mist', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml Sapa Citrus Tea Gin')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (54, 'vi', 'DaLat Flowerbomb Gin | Shot', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (55, 'vi', 'HoiAn Spice Road Gin | Shot', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (56, 'vi', 'VietNam Gin | Shot', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (57, 'vi', 'MeKong Delta Dry Gin | Shot', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (58, 'vi', 'Orange Gin | Shot', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml', 'Gin Việt Nam · 43% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (59, 'vi', 'East Sea Navy Gin | Shot', 'Gin Việt Nam · 57% ABV · 45ml', 'Gin Việt Nam · 57% ABV · 45ml', 'Gin Việt Nam · 57% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (60, 'vi', 'High Commissioner | Shot', 'Whisky · 40% ABV · 45ml', 'Whisky · 40% ABV · 45ml', 'Whisky · 40% ABV · 45ml')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();
INSERT INTO prod_v2.product_translations (product_id, locale, title, description, sub_description, allergen_info)
VALUES (61, 'vi', 'Croque Hải Sản | Premium', 'Sourdough với tôm, trai, đậu Hà Lan non, phô mai, béchamel & sốt bisque nhím biển', 'Sourdough với tôm, trai, đậu Hà Lan non, phô mai, béchamel & sốt bisque nhím biển', 'Sourdough với tôm, trai, đậu Hà Lan non, phô mai, béchamel & sốt bisque nhím biển')
ON CONFLICT (product_id, locale) DO UPDATE SET
  title = COALESCE(NULLIF(prod_v2.product_translations.title, ''), EXCLUDED.title),
  description = COALESCE(NULLIF(prod_v2.product_translations.description, ''), EXCLUDED.description),
  sub_description = COALESCE(NULLIF(prod_v2.product_translations.sub_description, ''), EXCLUDED.sub_description),
  allergen_info = COALESCE(NULLIF(prod_v2.product_translations.allergen_info, ''), EXCLUDED.allergen_info),
  updated_at = now();

-- product_category_translations
INSERT INTO prod_v2.product_category_translations (category_id, locale, name)
VALUES (1, 'vi', 'Món khai vị')
ON CONFLICT (category_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_category_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_category_translations (category_id, locale, name)
VALUES (2, 'vi', 'Món chính')
ON CONFLICT (category_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_category_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_category_translations (category_id, locale, name)
VALUES (3, 'vi', 'Cocktail Bar')
ON CONFLICT (category_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_category_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_category_translations (category_id, locale, name)
VALUES (4, 'vi', 'Coffee Bar')
ON CONFLICT (category_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_category_translations.name, ''), EXCLUDED.name),
  updated_at = now();

-- product_addon_translations
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (1, 'vi', 'Trứng')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (2, 'vi', 'Nấm')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (3, 'vi', 'Trứng')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (4, 'vi', 'Nấm')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (5, 'vi', 'Giăm bông')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (6, 'vi', 'Salad')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (7, 'vi', 'Trứng')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (8, 'vi', 'Phô mai Parmesan')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (9, 'vi', 'Mì Ý')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (10, 'vi', 'Nấm')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (11, 'vi', 'Trứng')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (12, 'vi', 'Mì Ý')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (13, 'vi', 'Thịt heo bằm')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (14, 'vi', 'Hạt')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();
INSERT INTO prod_v2.product_addon_translations (addon_id, locale, name)
VALUES (15, 'vi', 'Trứng')
ON CONFLICT (addon_id, locale) DO UPDATE SET
  name = COALESCE(NULLIF(prod_v2.product_addon_translations.name, ''), EXCLUDED.name),
  updated_at = now();

-- configs (ui)
-- homepage: 55 field
UPDATE prod_v2.configs SET value = '{"seo":{"title":{"en":"TALO Kitchen & Lounge - Home","vi":"TALO Kitchen & Lounge - Trang chủ"},"keywords":[{"keyword":{"en":"TALO Kitchen & Lounge","vi":"TALO Kitchen & Lounge"}},{"keyword":{"en":"restaurant","vi":"nhà hàng"}},{"keyword":{"en":"dining","vi":"ăn uống"}},{"keyword":{"en":"culinary","vi":"ẩm thực"}},{"keyword":{"en":"food","vi":"món ăn"}},{"keyword":{"en":"Ha Giang","vi":"Hà Giang"}},{"keyword":{"en":"TALO","vi":"TALO"}},{"keyword":{"en":"Talo","vi":"Talo"}},{"keyword":{"en":"brunch","vi":"brunch"}},{"keyword":{"en":"dinner near here","vi":"ăn tối gần đây"}},{"keyword":{"en":"dinner near me","vi":"ăn tối gần tôi"}},{"keyword":{"en":"Kitchen","vi":"Kitchen"}},{"keyword":{"en":"Lounge","vi":"Lounge"}}],"og_image":{"alt":"TALO Kitchen & Lounge - Ha Giang","url":"https://assets.talokitchenhg.com/HAPPYHOUR_BANER-5ac64052.webp"},"og_title":{"en":"TALO Kitchen & Lounge","vi":"TALO Kitchen & Lounge"},"description":{"en":"Welcome to TALO Kitchen & Lounge, where diverse flavors, fresh ingredients, and a friendly atmosphere create memorable meals. Reserve your table now!","vi":"Chào mừng bạn đến với TALO Kitchen & Lounge, nơi hương vị đa dạng, nguyên liệu tươi ngon và không gian thân thiện tạo nên những bữa ăn đáng nhớ. Đặt bàn ngay hôm nay!"},"og_description":{"en":"Welcome to TALO Kitchen & Lounge, where diverse flavors, fresh ingredients, and a friendly atmosphere create memorable meals. Reserve your table now!","vi":"Chào mừng bạn đến với TALO Kitchen & Lounge, nơi hương vị đa dạng, nguyên liệu tươi ngon và không gian thân thiện tạo nên những bữa ăn đáng nhớ. Đặt bàn ngay hôm nay!"}},"hero":{"image":{"alt":"TALO Kitchen & Lounge Ha Giang","url":"https://assets.talokitchenhg.com/TALO-Kitchen-Lounge-d41e378e.webp"},"title":[{"text":"Gather & Enjoy"},{"text":"French Flavors"},{"text":"In Ha Giang"}],"isShowTitle":true},"contact":{"title":[{"text":"Our Location"}],"location":{"address":{"en":"69 Nguyen Thai Hoc Street, Ha Giang 2 Ward, Tuyen Quang Province","vi":"69 Nguyễn Thái Học, Phường Hà Giang 2, Tỉnh Tuyên Quang"},"ggmap_link":"https://maps.app.goo.gl/EYzMXo5j7sacPYYs5"},"sub_title":[{"text":"Visit Us"}],"description":{"en":"Nestled in downtown Ha Giang, an intimate, enclosed Kitchen & Lounge — your cozy indoor refuge to escape the bustle and savor the moment.","vi":"Tọa lạc giữa trung tâm Hà Giang, TALO là một Kitchen & Lounge riêng tư, khép kín — nơi trú ẩn ấm cúng trong nhà để bạn thoát khỏi sự ồn ào và tận hưởng khoảnh khắc."},"contact_info":{"email":"talo.kitchenlounge@gmail.com","phone":"0898 082 138","whatsapp":"84898082138"},"opening_hours":[{"note":{"en":"(Note: Bar service continues until the last guest leaves.)","vi":"(Lưu ý: Quầy bar phục vụ đến khi vị khách cuối cùng ra về.)"},"items":[{"label":{"en":"Daily Opening","vi":"Mở cửa hằng ngày"},"value":"Monday - Sunday"},{"label":{"en":"Opening Hours","vi":"Giờ mở cửa"},"value":"4:00 PM - 2:00 AM"},{"label":{"en":"Last Order","vi":"Gọi món cuối"},"value":"1:30 AM"}],"title":{"en":"Restaurant Hours","vi":"Giờ mở cửa"}}]},"gallery":{"title":[{"text":"Our Gallery"}],"images":[{"image":{"alt":"TALO Kitchen & Lounge Ha Giang","url":"https://assets.talokitchenhg.com/TALO-CUSTOMER-HA-GIANG-96971569.webp"},"title":{"en":"Customer Moments","vi":"Khoảnh khắc của khách hàng"},"sub_title":{"en":"Where every visit becomes a warm and memorable experience","vi":"Nơi mỗi lần ghé thăm đều trở thành một trải nghiệm ấm áp và đáng nhớ"}},{"image":{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Bartender-Manager-Ha-Giang-071dfa68.webp"},"title":{"en":"Bartender Manager","vi":"Bartender Manager"},"sub_title":{"en":"Crafting memories, one cocktail at a time.","vi":"Tạo nên kỷ niệm, từng ly cocktail một."}},{"image":{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Barista-Manager-Ha-Giang-0e618b61.webp"},"title":{"en":"Barista Manager","vi":"Barista Manager"},"sub_title":{"en":"Where coffee meets connection.","vi":"Nơi cà phê kết nối mọi người."}},{"image":{"alt":"TALO Kitchen & Lounge - Customers","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-birthday-fcc8f7e7.webp"},"title":{"en":"The Joy of Dining","vi":"Niềm vui bên bàn ăn"},"sub_title":{"en":"Where every meal becomes a memory.","vi":"Nơi mỗi bữa ăn trở thành một kỷ niệm."}},{"image":{"alt":"TALO Kitchen & Lounge - Customers","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-Customer-5dc5597b.webp"},"title":{"en":"Warm Smiles, Good Times","vi":"Nụ cười ấm áp, giờ phút vui vẻ"},"sub_title":{"en":"This is what dining should feel like","vi":"Đây chính là cảm giác một bữa ăn nên có"}},{"image":{"alt":"TALO Kitchen & Lounge - Customers","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-team-17b75620.webp"},"title":{"en":"Where Guests Feel at Home ","vi":"Nơi khách cảm thấy như ở nhà"},"sub_title":{"en":"Comfort, warmth, and good food","vi":"Thoải mái, ấm áp và đồ ăn ngon"}},{"image":{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-Ha-Giang-Customer-85256b3b.webp"},"title":{"en":"A Place to Slow Down","vi":"Chốn để chậm lại"},"sub_title":{"en":"Good food, warm company, and time well spent.","vi":"Đồ ăn ngon, bầu bạn ấm áp và khoảng thời gian trọn vẹn."}},{"image":{"alt":"TALO Kitchen & Lounge - Clover Club ","url":"https://assets.talokitchenhg.com/TALO- Clover Club-1006aa9d.webp"},"title":{"en":"Soft on the eyes, smooth on the sip.","vi":"Dịu mắt, mượt mà từng ngụm."},"sub_title":{"en":"Rich, creamy, and utterly satisfying","vi":"Đậm đà, béo mịn và vô cùng thỏa mãn"}},{"image":{"alt":"TALO Kitchen & Lounge - Vietnamese Latte","url":"https://assets.talokitchenhg.com/TALO-Vietnamese-Latte-Ha-Giang-fa91b7cb.webp"},"title":{"en":"Vietnamese Latte","vi":"Vietnamese Latte"},"sub_title":{"en":"Sipping sweet moments with a Vietnamese Latte.","vi":"Thưởng thức những khoảnh khắc ngọt ngào cùng một ly Vietnamese Latte."}},{"image":{"alt":"Baked Camembert with Nuts & Berries","url":"https://assets.talokitchenhg.com/TALO-Baked-Camembert-with-Nuts-Berries-5-0d0b4f82.webp"},"title":{"en":"Baked Camembert","vi":"Camembert nướng"},"sub_title":{"en":"Best shared while it’s warm.","vi":"Ngon nhất khi cùng chia sẻ lúc còn nóng."}}],"autoplay":true,"sub_title":[{"text":"Welcome to our gallery"}]},"reviews":{"title":[{"text":"What Our Customers Say"}],"below_box":{"title":{"en":"Ready for Your Moment?","vi":"Sẵn sàng cho khoảnh khắc của bạn?"},"description":{"en":"Unwind in Flavor, Make It Your Moment.","vi":"Thư giãn trong hương vị, biến nó thành khoảnh khắc của riêng bạn."}},"sub_title":[{"text":"Customer Reviews"}],"description":{"en":"We’re always happy to hear from our customers!","vi":"Chúng tôi luôn vui khi được lắng nghe ý kiến từ khách hàng!"},"reviews_list":[{"date":"23/11/2025","rating":5,"comment":"Really unassuming spot, but we really wanted some pasta and this WAY OUTDID all our expectations. Chef was hand-whipping beure noisette to make hollandaise. Salad was nice and refreshing. Spaghetti with tomato sauce was clearly home-made with a lot of love. Can’t recommend this restaurant enough.","customer_name":"S."}]},"our_story":{"image":{"alt":"Our Story - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/DSC09461.jpg"},"title":[{"text":"A Taste of Home "},{"text":"in Ha Giang"}],"content":{"en":"𝙒𝙝𝙮 𝙏𝘼𝙇𝙊?\nTALO started with a simple idea: to bring a fresh perspective on food to Ha Giang. Ha Giang is full of unique ingredients and flavors shaped by its mountains, culture, and local traditions. We wanted to take those familiar things and explore different ways of preparing and combining them. \nIt’s not just about bringing outside dishes or techniques to Ha Giang. It’s about looking at what we already have here and asking ourselves what else we can do with it.\nSourdough came from that idea too. For Ha Giang, sourdough is still relatively new. We make our sourdough by hand and use it as a base for familiar dishes in a different way — from Croques and Tartines to combinations with local ingredients.\nWe love the idea of bringing something new together with flavors people already know, creating something that feels both unexpected and familiar. TALO isn’t about making everything complicated. We simply want to experiment, create, and find new ways for familiar ingredients to make their way onto the table.\nA little European.\nA little Ha Giang.\nAnd a lot of stories made from familiar things.\nThat’s what we want to build with TALO — a place where people can eat well, drink happily, try something new, and discover a little more about the food and flavors of this land along the way.\nGather & Enjoy.","vi":"Vì sao là TALO?\nTALO bắt đầu từ một ý tưởng giản dị: mang đến một góc nhìn mới về ẩm thực cho Hà Giang. Hà Giang có rất nhiều nguyên liệu và hương vị độc đáo, được tạo nên bởi núi rừng, văn hóa và truyền thống địa phương. Chúng tôi muốn lấy những điều quen thuộc ấy và thử khám phá những cách chế biến, kết hợp khác đi. \nĐiều này không chỉ là mang các món ăn hay kỹ thuật từ nơi khác về Hà Giang. Mà là nhìn lại những gì chúng ta đang có và tự hỏi: còn có thể làm gì nữa với chúng?\nSourdough cũng bắt nguồn từ ý tưởng đó. Với Hà Giang, bánh mì sourdough vẫn còn khá mới mẻ. Chúng tôi làm sourdough thủ công và dùng nó làm nền cho những món quen thuộc theo một cách khác — từ Croque, Tartine cho đến những sự kết hợp với nguyên liệu địa phương.\nChúng tôi thích ý tưởng đem điều mới mẻ hòa cùng những hương vị mà mọi người đã biết, tạo nên một thứ vừa bất ngờ vừa thân quen. TALO không muốn mọi thứ trở nên phức tạp. Chúng tôi chỉ đơn giản muốn thử nghiệm, sáng tạo và tìm ra những cách mới để các nguyên liệu quen thuộc lên bàn ăn.\nMột chút châu Âu.\nMột chút Hà Giang.\nVà thật nhiều câu chuyện được làm nên từ những điều thân quen.\nĐó là điều chúng tôi muốn xây dựng cùng TALO — một nơi để mọi người ăn ngon, uống vui, thử điều mới và khám phá thêm đôi chút về ẩm thực cũng như hương vị của vùng đất này.\nGather & Enjoy."},"sub_title":[{"text":"TALO Kitchen & Lounge"},{"text":"Our Story"}]},"why_choose_us":{"title":[{"text":"Why customers"},{"text":"choose us"}],"reasons":[{"desc":{"en":"We use only the freshest ingredients sourced from local farms.","vi":"Chúng tôi chỉ dùng những nguyên liệu tươi ngon nhất, lấy từ các nông trại địa phương."},"icon":"ph:leaf","title":{"en":"Fresh Ingredients","vi":"Nguyên liệu tươi"}},{"desc":{"en":"Warm, genuine, and attentive — our service is tailored to make you feel truly cared for from the moment you step inside.","vi":"Ấm áp, chân thành và chu đáo — dịch vụ của chúng tôi được thiết kế để bạn cảm thấy thực sự được quan tâm ngay từ khi bước vào quán."},"icon":"ph:users","title":{"en":"Exceptional Service","vi":"Dịch vụ xuất sắc"}},{"desc":{"en":"Our chefs bring authentic French flavors to every dish.","vi":"Các đầu bếp của chúng tôi mang hương vị Pháp chuẩn vị vào từng món ăn."},"icon":"ph:house","title":{"en":"Expert Chefs","vi":"Đầu bếp chuyên nghiệp"}}],"sub_title":[{"text":"FRESHNESS"},{"text":"HANDMADE"},{"text":"QUALITY"}],"description":{"en":"From fresh local ingredients to handmade care, our dishes blend modern touch with comforting flavors — serving you an authentic, heartfelt dining experience.","vi":"Từ nguyên liệu địa phương tươi ngon đến sự chăm chút thủ công, các món ăn của chúng tôi kết hợp nét hiện đại với hương vị ấm áp, quen thuộc — mang đến cho bạn trải nghiệm ẩm thực chân thực và đầy tâm huyết."}}}'::jsonb
WHERE key = 'homepage' AND config_type = 'ui'
  AND value = '{"seo":{"title":{"en":"TALO Kitchen & Lounge - Home","vi":""},"keywords":[{"keyword":{"en":"TALO Kitchen & Lounge","vi":""}},{"keyword":{"en":"restaurant","vi":""}},{"keyword":{"en":"dining","vi":""}},{"keyword":{"en":"culinary","vi":""}},{"keyword":{"en":"food","vi":""}},{"keyword":{"en":"Ha Giang","vi":""}},{"keyword":{"en":"TALO","vi":""}},{"keyword":{"en":"Talo","vi":""}},{"keyword":{"en":"brunch","vi":""}},{"keyword":{"en":"dinner near here","vi":""}},{"keyword":{"en":"dinner near me","vi":""}},{"keyword":{"en":"Kitchen","vi":""}},{"keyword":{"en":"Lounge","vi":""}}],"og_image":{"alt":"TALO Kitchen & Lounge - Ha Giang","url":"https://assets.talokitchenhg.com/HAPPYHOUR_BANER-5ac64052.webp"},"og_title":{"en":"TALO Kitchen & Lounge","vi":""},"description":{"en":"Welcome to TALO Kitchen & Lounge, where diverse flavors, fresh ingredients, and a friendly atmosphere create memorable meals. Reserve your table now!","vi":""},"og_description":{"en":"Welcome to TALO Kitchen & Lounge, where diverse flavors, fresh ingredients, and a friendly atmosphere create memorable meals. Reserve your table now!","vi":""}},"hero":{"image":{"alt":"TALO Kitchen & Lounge Ha Giang","url":"https://assets.talokitchenhg.com/TALO-Kitchen-Lounge-d41e378e.webp"},"title":[{"text":"Gather & Enjoy"},{"text":"French Flavors"},{"text":"In Ha Giang"}],"isShowTitle":true},"contact":{"title":[{"text":"Our Location"}],"location":{"address":{"en":"69 Nguyen Thai Hoc Street, Ha Giang 2 Ward, Tuyen Quang Province","vi":""},"ggmap_link":"https://maps.app.goo.gl/EYzMXo5j7sacPYYs5"},"sub_title":[{"text":"Visit Us"}],"description":{"en":"Nestled in downtown Ha Giang, an intimate, enclosed Kitchen & Lounge — your cozy indoor refuge to escape the bustle and savor the moment.","vi":""},"contact_info":{"email":"talo.kitchenlounge@gmail.com","phone":"0898 082 138","whatsapp":"84898082138"},"opening_hours":[{"note":{"en":"(Note: Bar service continues until the last guest leaves.)","vi":""},"items":[{"label":{"en":"Daily Opening","vi":""},"value":"Monday - Sunday"},{"label":{"en":"Opening Hours","vi":""},"value":"4:00 PM - 2:00 AM"},{"label":{"en":"Last Order","vi":""},"value":"1:30 AM"}],"title":{"en":"Restaurant Hours","vi":""}}]},"gallery":{"title":[{"text":"Our Gallery"}],"images":[{"image":{"alt":"TALO Kitchen & Lounge Ha Giang","url":"https://assets.talokitchenhg.com/TALO-CUSTOMER-HA-GIANG-96971569.webp"},"title":{"en":"Customer Moments","vi":""},"sub_title":{"en":"Where every visit becomes a warm and memorable experience","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Bartender-Manager-Ha-Giang-071dfa68.webp"},"title":{"en":"Bartender Manager","vi":""},"sub_title":{"en":"Crafting memories, one cocktail at a time.","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Barista-Manager-Ha-Giang-0e618b61.webp"},"title":{"en":"Barista Manager","vi":""},"sub_title":{"en":"Where coffee meets connection.","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge - Customers","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-birthday-fcc8f7e7.webp"},"title":{"en":"The Joy of Dining","vi":""},"sub_title":{"en":"Where every meal becomes a memory.","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge - Customers","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-Customer-5dc5597b.webp"},"title":{"en":"Warm Smiles, Good Times","vi":""},"sub_title":{"en":"This is what dining should feel like","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge - Customers","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-team-17b75620.webp"},"title":{"en":"Where Guests Feel at Home ","vi":""},"sub_title":{"en":"Comfort, warmth, and good food","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/Talo-Kitchen-Lounge-Ha-Giang-Customer-85256b3b.webp"},"title":{"en":"A Place to Slow Down","vi":""},"sub_title":{"en":"Good food, warm company, and time well spent.","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge - Clover Club ","url":"https://assets.talokitchenhg.com/TALO- Clover Club-1006aa9d.webp"},"title":{"en":"Soft on the eyes, smooth on the sip.","vi":""},"sub_title":{"en":"Rich, creamy, and utterly satisfying","vi":""}},{"image":{"alt":"TALO Kitchen & Lounge - Vietnamese Latte","url":"https://assets.talokitchenhg.com/TALO-Vietnamese-Latte-Ha-Giang-fa91b7cb.webp"},"title":{"en":"Vietnamese Latte","vi":""},"sub_title":{"en":"Sipping sweet moments with a Vietnamese Latte.","vi":""}},{"image":{"alt":"Baked Camembert with Nuts & Berries","url":"https://assets.talokitchenhg.com/TALO-Baked-Camembert-with-Nuts-Berries-5-0d0b4f82.webp"},"title":{"en":"Baked Camembert"},"sub_title":{"en":"Best shared while it’s warm."}}],"autoplay":true,"sub_title":[{"text":"Welcome to our gallery"}]},"reviews":{"title":[{"text":"What Our Customers Say"}],"below_box":{"title":{"en":"Ready for Your Moment?","vi":""},"description":{"en":"Unwind in Flavor, Make It Your Moment.","vi":""}},"sub_title":[{"text":"Customer Reviews"}],"description":{"en":"We’re always happy to hear from our customers!","vi":""},"reviews_list":[{"date":"23/11/2025","rating":5,"comment":"Really unassuming spot, but we really wanted some pasta and this WAY OUTDID all our expectations. Chef was hand-whipping beure noisette to make hollandaise. Salad was nice and refreshing. Spaghetti with tomato sauce was clearly home-made with a lot of love. Can’t recommend this restaurant enough.","customer_name":"S."}]},"our_story":{"image":{"alt":"Our Story - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/DSC09461.jpg"},"title":[{"text":"A Taste of Home "},{"text":"in Ha Giang"}],"content":{"en":"𝙒𝙝𝙮 𝙏𝘼𝙇𝙊?\nTALO started with a simple idea: to bring a fresh perspective on food to Ha Giang. Ha Giang is full of unique ingredients and flavors shaped by its mountains, culture, and local traditions. We wanted to take those familiar things and explore different ways of preparing and combining them. \nIt’s not just about bringing outside dishes or techniques to Ha Giang. It’s about looking at what we already have here and asking ourselves what else we can do with it.\nSourdough came from that idea too. For Ha Giang, sourdough is still relatively new. We make our sourdough by hand and use it as a base for familiar dishes in a different way — from Croques and Tartines to combinations with local ingredients.\nWe love the idea of bringing something new together with flavors people already know, creating something that feels both unexpected and familiar. TALO isn’t about making everything complicated. We simply want to experiment, create, and find new ways for familiar ingredients to make their way onto the table.\nA little European.\nA little Ha Giang.\nAnd a lot of stories made from familiar things.\nThat’s what we want to build with TALO — a place where people can eat well, drink happily, try something new, and discover a little more about the food and flavors of this land along the way.\nGather & Enjoy.","vi":""},"sub_title":[{"text":"TALO Kitchen & Lounge"},{"text":"Our Story"}]},"why_choose_us":{"title":[{"text":"Why customers"},{"text":"choose us"}],"reasons":[{"desc":{"en":"We use only the freshest ingredients sourced from local farms.","vi":""},"icon":"ph:leaf","title":{"en":"Fresh Ingredients","vi":""}},{"desc":{"en":"Warm, genuine, and attentive — our service is tailored to make you feel truly cared for from the moment you step inside.","vi":""},"icon":"ph:users","title":{"en":"Exceptional Service","vi":""}},{"desc":{"en":"Our chefs bring authentic French flavors to every dish.","vi":""},"icon":"ph:house","title":{"en":"Expert Chefs","vi":""}}],"sub_title":[{"text":"FRESHNESS"},{"text":"HANDMADE"},{"text":"QUALITY"}],"description":{"en":"From fresh local ingredients to handmade care, our dishes blend modern touch with comforting flavors — serving you an authentic, heartfelt dining experience.","vi":""}}}'::jsonb;  -- phải báo "UPDATE 1"
-- layout: 22 field
UPDATE prod_v2.configs SET value = '{"footer":{"contact":{"email":"talo.kitchenlounge@gmail.com","phone":"0898 082 138","address":{"en":"69 Nguyen Thai Hoc Street, Ha Giang 2 Ward, Tuyen Quang Province","vi":"69 Nguyễn Thái Học, Phường Hà Giang 2, Tỉnh Tuyên Quang"}},"socials":[{"href":"https://www.facebook.com/talo.kitchenlounge","icon":"ph:facebook-logo"},{"href":"https://www.instagram.com/talo.hagiang","icon":"ph:instagram-logo"}],"services":[{"label":{"en":"Family Gathering","vi":"Tụ họp gia đình"}},{"label":{"en":"Dating Couple","vi":"Hẹn hò"}},{"label":{"en":"Friends","vi":"Bạn bè"}},{"label":{"en":"Solo Dinner","vi":"Ăn tối một mình"}}],"description":{"en":"Good food, warm vibes, unforgettable flavors","vi":"Đồ ăn ngon, không khí ấm áp, hương vị khó quên"},"quick_links":[{"href":"/","label":{"en":"Home","vi":"Trang chủ"},"title":{"en":"Welcome to Our Table","vi":"Chào mừng đến với bàn ăn của chúng tôi"}},{"href":"/menu/all","label":{"en":"Menu","vi":"Thực đơn"},"title":{"en":"Explore Our Menu","vi":"Khám phá thực đơn của chúng tôi"}},{"href":"/reservation","label":{"en":"Reservation","vi":"Đặt bàn"},"title":{"en":"Book a Table","vi":"Đặt bàn ngay"}}],"opening_hours":[{"label":{"en":"Monday – Sunday","vi":"Thứ Hai – Chủ Nhật"},"value":"4:00 PM - 2:00 AM"},{"label":{"en":"Last Order","vi":"Gọi món cuối"},"value":"1:30 AM"}],"opening_hours_title":{"en":"Contact Information","vi":"Thông tin liên hệ"}},"header":{"phone":"0898 082 138","nav_bar":[{"href":"/","label":{"en":"Home","vi":"Trang chủ"},"title":{"en":"Home","vi":"Trang chủ"}},{"href":"/menu/all","label":{"en":"Menu","vi":"Thực đơn"},"title":{"en":"Menu","vi":"Thực đơn"}},{"href":"/reservation","label":{"en":"Reservation","vi":"Đặt bàn"},"title":{"en":"Reservation","vi":"Đặt bàn"}}],"open_daily":"04:00 PM - 02:00 AM","welcom_text":{"en":"Welcome to Ha Giang","vi":"Chào mừng đến với Hà Giang"}},"floating_actions":{"whatsAppCalling":{"showButton":true,"phoneNumber":"84898082138"},"showScrollToTopButton":true}}'::jsonb
WHERE key = 'layout' AND config_type = 'ui'
  AND value = '{"footer":{"contact":{"email":"talo.kitchenlounge@gmail.com","phone":"0898 082 138","address":{"en":"69 Nguyen Thai Hoc Street, Ha Giang 2 Ward, Tuyen Quang Province","vi":""}},"socials":[{"href":"https://www.facebook.com/talo.kitchenlounge","icon":"ph:facebook-logo"},{"href":"https://www.instagram.com/talo.hagiang","icon":"ph:instagram-logo"}],"services":[{"label":{"en":"Family Gathering","vi":""}},{"label":{"en":"Dating Couple","vi":""}},{"label":{"en":"Friends","vi":""}},{"label":{"en":"Solo Dinner","vi":""}}],"description":{"en":"Good food, warm vibes, unforgettable flavors","vi":""},"quick_links":[{"href":"/","label":{"en":"Home","vi":""},"title":{"en":"Welcome to Our Table","vi":""}},{"href":"/menu/all","label":{"en":"Menu","vi":""},"title":{"en":"Explore Our Menu","vi":""}},{"href":"/reservation","label":{"en":"Reservation","vi":""},"title":{"en":"Book a Table","vi":""}}],"opening_hours":[{"label":{"en":"Monday – Sunday","vi":""},"value":"4:00 PM - 2:00 AM"},{"label":{"en":"Last Order","vi":""},"value":"1:30 AM"}],"opening_hours_title":{"en":"Contact Information","vi":""}},"header":{"phone":"0898 082 138","nav_bar":[{"href":"/","label":{"en":"Home","vi":""},"title":{"en":"Home","vi":""}},{"href":"/menu/all","label":{"en":"Menu","vi":""},"title":{"en":"Menu","vi":""}},{"href":"/reservation","label":{"en":"Reservation","vi":""},"title":{"en":"Reservation","vi":""}}],"open_daily":"04:00 PM - 02:00 AM","welcom_text":{"en":"Welcome to Ha Giang","vi":""}},"floating_actions":{"whatsAppCalling":{"showButton":true,"phoneNumber":"84898082138"},"showScrollToTopButton":true}}'::jsonb;  -- phải báo "UPDATE 1"
-- menu_page: 36 field
UPDATE prod_v2.configs SET value = '{"seo":{"title":{"en":"Menu","vi":"Thực đơn"},"keywords":[{"keyword":{"en":"menu","vi":"thực đơn"}},{"keyword":{"en":"restaurant menu","vi":"thực đơn nhà hàng"}},{"keyword":{"en":"food","vi":"món ăn"}},{"keyword":{"en":"TALO Kitchen & Lounge","vi":"TALO Kitchen & Lounge"}},{"keyword":{"en":"TALO Kitchen","vi":"TALO Kitchen"}},{"keyword":{"en":"TaLo","vi":"TaLo"}},{"keyword":{"en":"restaurants","vi":"nhà hàng"}},{"keyword":{"en":"Brunch","vi":"Brunch"}},{"keyword":{"en":"dinner near here","vi":"ăn tối gần đây"}},{"keyword":{"en":"food near me","vi":"đồ ăn gần tôi"}},{"keyword":{"en":"restaurants near me","vi":"nhà hàng gần tôi"}},{"keyword":{"en":"family dinner","vi":"bữa tối gia đình"}},{"keyword":{"en":"good restaurant near me","vi":"nhà hàng ngon gần tôi"}},{"keyword":{"en":"good pasta near me","vi":"mì Ý ngon gần tôi"}},{"keyword":{"en":"Lounge","vi":"Lounge"}},{"keyword":{"en":"Cocktail Bar","vi":"Cocktail Bar"}}],"og_image":{"alt":"TALO Kitchen & Lounge - Menu","url":"https://assets.talokitchenhg.com/HAPPYHOUR_BANER-5ac64052.webp"},"og_title":{"en":"Our Menu | TALO Kitchen & Lounge","vi":"Thực đơn | TALO Kitchen & Lounge"},"description":{"en":"Explore our delightful menu at TALO Kitchen & Lounge, where fresh ingredients and familiar flavors bring you a warm, comforting taste of home.","vi":"Khám phá thực đơn hấp dẫn tại TALO Kitchen & Lounge, nơi nguyên liệu tươi ngon và hương vị quen thuộc mang đến cho bạn cảm giác ấm áp, như đang thưởng thức món ăn ở nhà."},"og_description":{"en":"Explore our delightful menu at TALO Kitchen & Lounge, where fresh ingredients and familiar flavors bring you a warm, comforting taste of home.","vi":"Khám phá thực đơn hấp dẫn tại TALO Kitchen & Lounge, nơi nguyên liệu tươi ngon và hương vị quen thuộc mang đến cho bạn cảm giác ấm áp, như đang thưởng thức món ăn ở nhà."}},"hero":{"title":[{"text":"Explore Our Delicious Menu"},{"text":"Savor the Flavors of France"}],"images":[{"alt":"TALO Kitchen & Lounge - Cocktail","url":"https://assets.talokitchenhg.com/HAPPYHOUR_BANER-5ac64052.webp"},{"alt":"TALO-Kitchen-Lounge","url":"https://assets.talokitchenhg.com/TALO-Customer-Cocktail7-5c17ce35.webp"},{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Customer-Cocktail5-dc231ac3.webp"},{"alt":"Seafood Pasta - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Seafood-Pasta-ee46841f.webp"},{"alt":"Mango Passion Fruit Tea - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Mango-Passion-Fruit-Tea-Ha-Giang-1-ae830fa6.webp"}],"autoplay":true},"new_product":{"label":{"en":"Seafood Pasta","vi":"Mì Ý hải sản"},"title":[{"text":"New Arrivals"},{"text":"Fresh Flavors to Try"}],"banner":{"alt":"Seafood Pasta - Ha Giang","url":"https://assets.talokitchenhg.com/TALO-Seafood-Pasta-5824e102.webp"},"isShow":true,"sub_label":{"en":"Pasta with Prawns, Mussels, Petit Pois & Uni Bisque","vi":"Mì Ý với tôm, trai, đậu Hà Lan non và sốt bisque nhím biển"},"sub_title":[{"text":"Discover Our Latest Culinary Creations"},{"text":"Exciting New Dishes Await You"}],"description":{"en":"Be the first to savor our newest additions, crafted with the freshest ingredients and innovative flavors.","vi":"Hãy là người đầu tiên thưởng thức những món mới nhất của chúng tôi, được chế biến từ nguyên liệu tươi ngon nhất cùng những hương vị sáng tạo."},"product_slug":"croque-seafood-premium"},"why_choose_us":{"title":[{"text":"Why customers"},{"text":"choose us"}],"reasons":[{"desc":{"en":"We use only the freshest ingredients sourced from local farms.","vi":"Chúng tôi chỉ dùng những nguyên liệu tươi ngon nhất, lấy từ các nông trại địa phương."},"icon":"ph:leaf","title":{"en":"Fresh Ingredients","vi":"Nguyên liệu tươi"}},{"desc":{"en":"We’re committed to delivering warm, attentive, and professional service that makes every guest feel truly cared for.","vi":"Chúng tôi cam kết mang đến dịch vụ ấm áp, chu đáo và chuyên nghiệp, để mỗi vị khách đều cảm thấy thực sự được quan tâm."},"icon":"ph:users","title":{"en":"Exceptional Service","vi":"Dịch vụ xuất sắc"}},{"desc":{"en":"Our chefs bring authentic French flavors to every dish.","vi":"Các đầu bếp của chúng tôi mang hương vị Pháp chuẩn vị vào từng món ăn."},"icon":"ph:house","title":{"en":"Expert Chefs","vi":"Đầu bếp chuyên nghiệp"}}],"sub_title":[{"text":"FRESHNESS"},{"text":"HANDMADE"},{"text":"QUALITY"}],"description":{"en":"Discover what makes TALO Kitchen & Lounge a beloved French dining spot in Ha Giang, where every detail is crafted with warmth and care to gently surpass your expectations.","vi":"Khám phá điều khiến TALO Kitchen & Lounge trở thành địa điểm ẩm thực Pháp được yêu thích ở Hà Giang, nơi từng chi tiết đều được chăm chút bằng sự ấm áp và tận tâm để nhẹ nhàng vượt qua mong đợi của bạn."}},"food_categories":{"title":[{"text":"Our Menu Categories"},{"text":"Diverse Flavors to Satisfy Every Palate"}],"sub_title":[{"text":"Discover our latest culinary creations"},{"text":"A Culinary Adventure Awaits"}],"categories_to_show":[{"key":"main-course","label":{"en":"Main Course","vi":"Món chính"},"page_title":{"en":"Main Course - TALO Kitchen & Lounge","vi":"Món chính - TALO Kitchen & Lounge"}},{"key":"cocktail-bar","label":{"en":"Cocktail Bar","vi":"Cocktail Bar"},"page_title":{"en":"Cocktail Bar - TALO Kitchen & Lounge","vi":"Cocktail Bar - TALO Kitchen & Lounge"}},{"key":"coffee-bar","label":{"en":"Coffee Bar","vi":"Coffee Bar"},"page_title":{"en":"Coffee Bar - TALO Kitchen & Lounge","vi":"Coffee Bar - TALO Kitchen & Lounge"}}]}}'::jsonb
WHERE key = 'menu_page' AND config_type = 'ui'
  AND value = '{"seo":{"title":{"en":"Menu","vi":""},"keywords":[{"keyword":{"en":"menu","vi":""}},{"keyword":{"en":"restaurant menu","vi":""}},{"keyword":{"en":"food","vi":""}},{"keyword":{"en":"TALO Kitchen & Lounge","vi":""}},{"keyword":{"en":"TALO Kitchen","vi":""}},{"keyword":{"en":"TaLo","vi":""}},{"keyword":{"en":"restaurants","vi":""}},{"keyword":{"en":"Brunch","vi":""}},{"keyword":{"en":"dinner near here","vi":""}},{"keyword":{"en":"food near me","vi":""}},{"keyword":{"en":"restaurants near me","vi":""}},{"keyword":{"en":"family dinner","vi":""}},{"keyword":{"en":"good restaurant near me","vi":""}},{"keyword":{"en":"good pasta near me","vi":""}},{"keyword":{"en":"Lounge","vi":""}},{"keyword":{"en":"Cocktail Bar","vi":""}}],"og_image":{"alt":"TALO Kitchen & Lounge - Menu","url":"https://assets.talokitchenhg.com/HAPPYHOUR_BANER-5ac64052.webp"},"og_title":{"en":"Our Menu | TALO Kitchen & Lounge","vi":""},"description":{"en":"Explore our delightful menu at TALO Kitchen & Lounge, where fresh ingredients and familiar flavors bring you a warm, comforting taste of home.","vi":""},"og_description":{"en":"Explore our delightful menu at TALO Kitchen & Lounge, where fresh ingredients and familiar flavors bring you a warm, comforting taste of home.","vi":""}},"hero":{"title":[{"text":"Explore Our Delicious Menu"},{"text":"Savor the Flavors of France"}],"images":[{"alt":"TALO Kitchen & Lounge - Cocktail","url":"https://assets.talokitchenhg.com/HAPPYHOUR_BANER-5ac64052.webp"},{"alt":"TALO-Kitchen-Lounge","url":"https://assets.talokitchenhg.com/TALO-Customer-Cocktail7-5c17ce35.webp"},{"alt":"TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Customer-Cocktail5-dc231ac3.webp"},{"alt":"Seafood Pasta - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Seafood-Pasta-ee46841f.webp"},{"alt":"Mango Passion Fruit Tea - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/TALO-Mango-Passion-Fruit-Tea-Ha-Giang-1-ae830fa6.webp"}],"autoplay":true},"new_product":{"label":{"en":"Seafood Pasta","vi":""},"title":[{"text":"New Arrivals"},{"text":"Fresh Flavors to Try"}],"banner":{"alt":"Seafood Pasta - Ha Giang","url":"https://assets.talokitchenhg.com/TALO-Seafood-Pasta-5824e102.webp"},"isShow":true,"sub_label":{"en":"Pasta with Prawns, Mussels, Petit Pois & Uni Bisque","vi":""},"sub_title":[{"text":"Discover Our Latest Culinary Creations"},{"text":"Exciting New Dishes Await You"}],"description":{"en":"Be the first to savor our newest additions, crafted with the freshest ingredients and innovative flavors.","vi":""},"product_slug":"croque-seafood-premium"},"why_choose_us":{"title":[{"text":"Why customers"},{"text":"choose us"}],"reasons":[{"desc":{"en":"We use only the freshest ingredients sourced from local farms.","vi":""},"icon":"ph:leaf","title":{"en":"Fresh Ingredients","vi":""}},{"desc":{"en":"We’re committed to delivering warm, attentive, and professional service that makes every guest feel truly cared for.","vi":""},"icon":"ph:users","title":{"en":"Exceptional Service","vi":""}},{"desc":{"en":"Our chefs bring authentic French flavors to every dish.","vi":""},"icon":"ph:house","title":{"en":"Expert Chefs","vi":""}}],"sub_title":[{"text":"FRESHNESS"},{"text":"HANDMADE"},{"text":"QUALITY"}],"description":{"en":"Discover what makes TALO Kitchen & Lounge a beloved French dining spot in Ha Giang, where every detail is crafted with warmth and care to gently surpass your expectations.","vi":""}},"food_categories":{"title":[{"text":"Our Menu Categories"},{"text":"Diverse Flavors to Satisfy Every Palate"}],"sub_title":[{"text":"Discover our latest culinary creations"},{"text":"A Culinary Adventure Awaits"}],"categories_to_show":[{"key":"main-course","label":{"en":"Main Course","vi":""},"page_title":{"en":"Main Course - TALO Kitchen & Lounge","vi":""}},{"key":"cocktail-bar","label":{"en":"Cocktail Bar","vi":""},"page_title":{"en":"Cocktail Bar - TALO Kitchen & Lounge","vi":""}},{"key":"coffee-bar","label":{"en":"Coffee Bar","vi":""},"page_title":{"en":"Coffee Bar - TALO Kitchen & Lounge","vi":""}}]}}'::jsonb;  -- phải báo "UPDATE 1"
-- reservation_page: 29 field
UPDATE prod_v2.configs SET value = '{"seo":{"title":{"en":"Reservation | TALO Kitchen & Lounge","vi":"Đặt bàn | TALO Kitchen & Lounge"},"keywords":[{"keyword":{"en":"reservation","vi":"đặt bàn"}},{"keyword":{"en":"book table","vi":"book bàn"}},{"keyword":{"en":"restaurant booking","vi":"đặt bàn nhà hàng"}},{"keyword":{"en":"TALO Kitchen & Lounge","vi":"TALO Kitchen & Lounge"}},{"keyword":{"en":"TaLo Kitchen","vi":"TaLo Kitchen"}},{"keyword":{"en":"Lounge","vi":"Lounge"}},{"keyword":{"en":"talo kitchen","vi":"talo kitchen"}},{"keyword":{"en":"Restaurant near me","vi":"nhà hàng gần tôi"}},{"keyword":{"en":"cocktail bar","vi":"cocktail bar"}}],"og_image":{"alt":"Reserve Your Table at TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/L-Telle-Eatery-Booking-Ha Giang.webp"},"og_title":{"en":"Reserve Your Table | TALO Kitchen & Lounge","vi":"Đặt bàn ngay | TALO Kitchen & Lounge"},"description":{"en":"Reserve your table at TALO Kitchen & Lounge. Experience a meal to remember with fresh ingredients and authentic flavors in a warm atmosphere.","vi":"Đặt bàn tại TALO Kitchen & Lounge. Tận hưởng một bữa ăn đáng nhớ với nguyên liệu tươi ngon và hương vị chuẩn vị trong không gian ấm áp."},"og_description":{"en":"Reserve your table at TALO Kitchen & Lounge. Experience a meal to remember with fresh ingredients and authentic flavors in a warm atmosphere.","vi":"Đặt bàn tại TALO Kitchen & Lounge. Tận hưởng một bữa ăn đáng nhớ với nguyên liệu tươi ngon và hương vị chuẩn vị trong không gian ấm áp."}},"hero":{"title":[{"text":"Discover & Delight "},{"text":"in French Flavors"}],"banner":{"alt":"Reservation - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/L-Telle-Eatery-Booking-Ha Giang.webp"}},"booking":{"note":{"en":"Please arrive about 10 minutes before your reservation time so we can prepare the best experience for you.","vi":"Vui lòng đến sớm khoảng 10 phút trước giờ đặt bàn để chúng tôi chuẩn bị trải nghiệm tốt nhất cho bạn."},"title":[{"text":"Our Menu Categories"},{"text":"Diverse Flavors to Satisfy Every Palate"}],"contact":{"email":"talo.kitchenlounge@gmail.com","phone":"0898 082 138"},"sub_title":[{"text":"Discover our latest culinary creations"},{"text":"A Culinary Adventure Awaits"}],"description":{"en":"Enjoy a little taste trip to France with every dish on our menu.","vi":"Mỗi món trong thực đơn của chúng tôi là một chuyến du hành nhỏ đến nước Pháp."},"success_title":{"en":"Reservation Submitted Successfully!","vi":"Đặt bàn thành công!"},"reservation_info":[{"icon":"bi:people","items":[{"text":{"en":"We accommodate parties of 1-8 guests. For larger groups, please call us directly.","vi":"Chúng tôi phục vụ nhóm từ 1-8 khách. Với nhóm đông hơn, vui lòng gọi trực tiếp cho chúng tôi."},"type":"text"}],"title":{"en":"Group size","vi":"Số lượng khách"}},{"icon":"tabler:clock","items":[{"text":{"en":"Daily:","vi":"Hằng ngày:"},"type":"label"},{"text":{"en":"Monday - Sunday","vi":"Thứ Hai - Chủ Nhật"},"type":"bullet"},{"text":{"en":"Opening Hours","vi":"Giờ mở cửa"},"type":"label"},{"text":{"en":"4:00 PM - 2:00 AM","vi":"16:00 - 02:00"},"type":"bullet"},{"text":{"en":"Last order:","vi":"Gọi món cuối:"},"type":"label"},{"text":{"en":"1:30 AM","vi":"01:30"},"type":"bullet"},{"text":{"en":"(Note: Bar service continues until the last guest leaves.)","vi":"(Lưu ý: Quầy bar phục vụ đến khi vị khách cuối cùng ra về.)"},"type":"note"}],"title":{"en":"Operating Hours","vi":"Giờ hoạt động"}},{"icon":"ph:chat-circle","items":[{"text":{"en":"Please notify us at least 4 hours in advance for any changes or cancellations.","vi":"Vui lòng báo cho chúng tôi trước ít nhất 4 giờ nếu bạn muốn thay đổi hoặc hủy đặt bàn."},"type":"text"}],"title":{"en":"Cancellation Policy","vi":"Chính sách hủy bàn"}}],"success_description":{"en":"Thank you for choosing our restaurant. We’ve received your reservation request, and we’ll be in touch shortly to confirm everything. We look forward to welcoming you soon.","vi":"Cảm ơn bạn đã chọn nhà hàng của chúng tôi. Chúng tôi đã nhận được yêu cầu đặt bàn của bạn và sẽ sớm liên hệ để xác nhận. Rất mong được đón tiếp bạn."}}}'::jsonb
WHERE key = 'reservation_page' AND config_type = 'ui'
  AND value = '{"seo":{"title":{"en":"Reservation | TALO Kitchen & Lounge","vi":""},"keywords":[{"keyword":{"en":"reservation","vi":""}},{"keyword":{"en":"book table","vi":""}},{"keyword":{"en":"restaurant booking","vi":""}},{"keyword":{"en":"TALO Kitchen & Lounge","vi":""}},{"keyword":{"en":"TaLo Kitchen","vi":""}},{"keyword":{"en":"Lounge","vi":""}},{"keyword":{"en":"talo kitchen","vi":""}},{"keyword":{"en":"Restaurant near me","vi":""}},{"keyword":{"en":"cocktail bar","vi":""}}],"og_image":{"alt":"Reserve Your Table at TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/L-Telle-Eatery-Booking-Ha Giang.webp"},"og_title":{"en":"Reserve Your Table | TALO Kitchen & Lounge","vi":""},"description":{"en":"Reserve your table at TALO Kitchen & Lounge. Experience a meal to remember with fresh ingredients and authentic flavors in a warm atmosphere.","vi":""},"og_description":{"en":"Reserve your table at TALO Kitchen & Lounge. Experience a meal to remember with fresh ingredients and authentic flavors in a warm atmosphere.","vi":""}},"hero":{"title":[{"text":"Discover & Delight "},{"text":"in French Flavors"}],"banner":{"alt":"Reservation - TALO Kitchen & Lounge","url":"https://assets.talokitchenhg.com/L-Telle-Eatery-Booking-Ha Giang.webp"}},"booking":{"note":{"en":"Please arrive about 10 minutes before your reservation time so we can prepare the best experience for you.","vi":""},"title":[{"text":"Our Menu Categories"},{"text":"Diverse Flavors to Satisfy Every Palate"}],"contact":{"email":"talo.kitchenlounge@gmail.com","phone":"0898 082 138"},"sub_title":[{"text":"Discover our latest culinary creations"},{"text":"A Culinary Adventure Awaits"}],"description":{"en":"Enjoy a little taste trip to France with every dish on our menu.","vi":""},"success_title":{"en":"Reservation Submitted Successfully!","vi":""},"reservation_info":[{"icon":"bi:people","items":[{"text":{"en":"We accommodate parties of 1-8 guests. For larger groups, please call us directly.","vi":""},"type":"text"}],"title":{"en":"Group size","vi":""}},{"icon":"tabler:clock","items":[{"text":{"en":"Daily:","vi":""},"type":"label"},{"text":{"en":"Monday - Sunday","vi":""},"type":"bullet"},{"text":{"en":"Opening Hours","vi":""},"type":"label"},{"text":{"en":"4:00 PM - 2:00 AM","vi":""},"type":"bullet"},{"text":{"en":"Last order:","vi":""},"type":"label"},{"text":{"en":"1:30 AM","vi":""},"type":"bullet"},{"text":{"en":"(Note: Bar service continues until the last guest leaves.)","vi":""},"type":"note"}],"title":{"en":"Operating Hours","vi":""}},{"icon":"ph:chat-circle","items":[{"text":{"en":"Please notify us at least 4 hours in advance for any changes or cancellations.","vi":""},"type":"text"}],"title":{"en":"Cancellation Policy","vi":""}}],"success_description":{"en":"Thank you for choosing our restaurant. We’ve received your reservation request, and we’ll be in touch shortly to confirm everything. We look forward to welcoming you soon.","vi":""}}}'::jsonb;  -- phải báo "UPDATE 1"

COMMIT;
