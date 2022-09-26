CREATE OR REPLACE FUNCTION FW_STUDENT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       searchTerm IN STRING, filter IN STRING, sortKey IN STRING, sortMode IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO          SYS_REFCURSOR;
    ST                    STRING(500) := '%' || lower(searchTerm) || '%';
    listFaculty           STRING(50);
    listFromCity          STRING(50);
    listEthnic            STRING(50);
    listNationality       STRING(50);
    listReligion          STRING(50);
    listLoaiHinhDaoTao    STRING(50);
    listLoaiSinhVien      STRING(50);
    listTinhTrangSinhVien STRING(50);
    listKhoaSinhVien      STRING(50);
    fromNhapHoc           NUMBER(20);
    toNhapHoc             NUMBER(20);
    gender                STRING(5);

BEGIN
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listFromCity') INTO listFromCity FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listFaculty') INTO listFaculty FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listEthnic') INTO listEthnic FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNationality') INTO listNationality FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listReligion') INTO listReligion FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiHinhDaoTao') INTO listLoaiHinhDaoTao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listLoaiSinhVien') INTO listLoaiSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTinhTrangSinhVien') INTO listTinhTrangSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listKhoaSinhVien') INTO listKhoaSinhVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromNhapHoc') INTO fromNhapHoc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toNhapHoc') INTO toNhapHoc FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM FW_STUDENT STU
             LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
             LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
             LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
             LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
             LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
             LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
             LEFT JOIN DM_TINH_THANH_PHO TTSV ON TTSV.MA = STU.NOI_SINH_MA_TINH

             LEFT JOIN DM_PHUONG_XA xaThuongTru ON STU.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
             LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STU.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
             LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STU.THUONG_TRU_MA_TINH = tinhThuongTru.MA


             LEFT JOIN DM_PHUONG_XA xaThuongTruCha ON STU.THUONG_TRU_MA_XA_CHA = xaThuongTruCha.MA_PHUONG_XA
             LEFT JOIN DM_QUAN_HUYEN huyenThuongTruCha
                       ON STU.THUONG_TRU_MA_HUYEN_CHA = huyenThuongTruCha.MA_QUAN_HUYEN
             LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruCha ON STU.THUONG_TRU_MA_TINH_CHA = tinhThuongTruCha.MA

             LEFT JOIN DM_PHUONG_XA xaThuongTruMe ON STU.THUONG_TRU_MA_XA_ME = xaThuongTruMe.MA_PHUONG_XA
             LEFT JOIN DM_QUAN_HUYEN huyenThuongTruMe
                       ON STU.THUONG_TRU_MA_HUYEN_ME = huyenThuongTruMe.MA_QUAN_HUYEN
             LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruMe ON STU.THUONG_TRU_MA_TINH_ME = tinhThuongTruMe.MA

             LEFT JOIN DM_PHUONG_XA xaLienLac ON STU.LIEN_LAC_MA_XA = xaLienLac.MA_PHUONG_XA
             LEFT JOIN DM_QUAN_HUYEN huyenLienLac ON STU.LIEN_LAC_MA_HUYEN = huyenLienLac.MA_QUAN_HUYEN
             LEFT JOIN DM_TINH_THANH_PHO tinhLienLac ON STU.LIEN_LAC_MA_TINH = tinhLienLac.MA

             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
             LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
    WHERE ((listFaculty IS NULL OR STU.KHOA IN UTILS_SPLIT_FILTER(listFaculty))
        AND (listFromCity IS NULL OR STU.THUONG_TRU_MA_TINH IN UTILS_SPLIT_FILTER(listFromCity))
        AND (listKhoaSinhVien IS NULL OR STU.NAM_TUYEN_SINH IN UTILS_SPLIT_FILTER(listKhoaSinhVien))
        AND (listEthnic IS NULL OR STU.DAN_TOC IN UTILS_SPLIT_FILTER(listEthnic))
        AND (listNationality IS NULL OR STU.QUOC_GIA IN UTILS_SPLIT_FILTER(listNationality))
        AND (listReligion IS NULL OR STU.DAN_TOC IN UTILS_SPLIT_FILTER(listReligion))
        AND
           (listLoaiHinhDaoTao IS NULL OR STU.LOAI_HINH_DAO_TAO IN UTILS_SPLIT_FILTER(listLoaiHinhDaoTao))
        AND (listLoaiSinhVien IS NULL OR STU.LOAI_SINH_VIEN IN UTILS_SPLIT_FILTER(listLoaiSinhVien))
        AND (listTinhTrangSinhVien IS NULL OR STU.TINH_TRANG IN UTILS_SPLIT_FILTER(listTinhTrangSinhVien))
        AND (gender IS NOT NULL AND (0 || STU.GIOI_TINH) = gender OR gender IS NULL)
        AND ((fromNhapHoc IS NOT NULL AND toNhapHoc IS NOT NULL AND fromNhapHoc < STU.NGAY_NHAP_HOC AND
              STU.NGAY_NHAP_HOC < toNhapHoc) OR toNhapHoc IS NULL OR fromNhapHoc IS NULL)
        )
      AND (searchTerm = ''
        OR LOWER(STU.MSSV) = LOWER(searchTerm)
        OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE ST
        OR LOWER(STU.MA_NGANH) LIKE ST
        OR LOWER(STU.LOP) LIKE ST
        OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE ST
        OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE ST
        OR LOWER(STU.EMAIL_CA_NHAN) LIKE ST);


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN STUDENT_INFO FOR
        SELECT *
        FROM (SELECT STU.MSSV                      AS  "mssv",
                     STU.HO                        AS  "ho",
                     STU.TEN                       AS  "ten",
                     STU.EMAIL_CA_NHAN             AS  "emailCaNhan",
                     STU.EMAIL_TRUONG              AS  "emailTruong",
                     STU.NGAY_SINH                 AS  "ngaySinh",
                     STU.GIOI_TINH                 AS  "gioiTinh",
                     STU.DAN_TOC                   AS  "maDanToc",
                     STU.QUOC_GIA                  AS  "maQuocGia",
                     LSV.TEN                       AS  "loaiSinhVien",
                     LHDT.TEN                      AS  "loaiHinhDaoTao",
                     TTSV.TEN                      AS  "tinhTrangSinhVien",
                     STU.KHOA                      AS  "khoa",
                     NS.TEN                        AS  "noiSinh",
                     NDT.TEN_NGANH                 AS  "tenNganh",
                     xaThuongTru.TEN_PHUONG_XA     as  "xaThuongTru",
                     huyenThuongTru.TEN_QUAN_HUYEN as  "huyenThuongTru",
                     tinhThuongTru.ten             as  "tinhThuongTru",
                     STU.THUONG_TRU_SO_NHA         AS  "soNhaThuongTru",

                     tinhLienLac.TEN               AS  "tinhLienLac",
                     huyenLienLac.TEN_QUAN_HUYEN   AS  "huyenLienLac",
                     xaLienLac.TEN_PHUONG_XA       AS  "xaLienLac",
                     STU.LIEN_LAC_SO_NHA           AS  "soNhaLienLac",
                     STU.DIEN_THOAI_CA_NHAN        AS  "dienThoaiCaNhan",
                     STU.HO_TEN_NGUOI_LIEN_LAC     AS  "hoTenNguoiLienLac",
                     STU.SDT_NGUOI_LIEN_LAC        AS  "sdtNguoiLienLac",
                     KHOA.TEN                      AS  "tenKhoa",
                     STU.MA_NGANH                  AS  "maNganh",
                     STU.LOP                       AS  "lop",
                     TONGIAO.TEN                   AS  "tonGiao",
                     QG.TEN_QUOC_GIA               AS  "quocTich",
                     DANTOC.TEN                    AS  "danToc",
                     STU.NAM_TUYEN_SINH            AS  "namTuyenSinh",
                     STU.NGAY_NHAP_HOC             AS  "ngayNhapHoc",
                     STU.CAN_EDIT                  AS  "canEdit",
                     ROW_NUMBER() OVER (ORDER BY NULL) R
              FROM FW_STUDENT STU
                       LEFT JOIN DM_SV_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
                       LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
                       LEFT JOIN DT_NGANH_DAO_TAO NDT ON NDT.MA_NGANH = STU.MA_NGANH
                       LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                       LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                       LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                       LEFT JOIN DM_TINH_THANH_PHO NS ON NS.MA = STU.NOI_SINH_MA_TINH

                       LEFT JOIN DM_PHUONG_XA xaThuongTru ON STU.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                       LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STU.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                       LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STU.THUONG_TRU_MA_TINH = tinhThuongTru.MA


                       LEFT JOIN DM_PHUONG_XA xaThuongTruCha ON STU.THUONG_TRU_MA_XA_CHA = xaThuongTruCha.MA_PHUONG_XA
                       LEFT JOIN DM_QUAN_HUYEN huyenThuongTruCha
                                 ON STU.THUONG_TRU_MA_HUYEN_CHA = huyenThuongTruCha.MA_QUAN_HUYEN
                       LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruCha ON STU.THUONG_TRU_MA_TINH_CHA = tinhThuongTruCha.MA

                       LEFT JOIN DM_PHUONG_XA xaThuongTruMe ON STU.THUONG_TRU_MA_XA_ME = xaThuongTruMe.MA_PHUONG_XA
                       LEFT JOIN DM_QUAN_HUYEN huyenThuongTruMe
                                 ON STU.THUONG_TRU_MA_HUYEN_ME = huyenThuongTruMe.MA_QUAN_HUYEN
                       LEFT JOIN DM_TINH_THANH_PHO tinhThuongTruMe ON STU.THUONG_TRU_MA_TINH_ME = tinhThuongTruMe.MA

                       LEFT JOIN DM_PHUONG_XA xaLienLac ON STU.LIEN_LAC_MA_XA = xaLienLac.MA_PHUONG_XA
                       LEFT JOIN DM_QUAN_HUYEN huyenLienLac ON STU.LIEN_LAC_MA_HUYEN = huyenLienLac.MA_QUAN_HUYEN
                       LEFT JOIN DM_TINH_THANH_PHO tinhLienLac ON STU.LIEN_LAC_MA_TINH = tinhLienLac.MA

                       LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                       LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
              WHERE ((listFaculty IS NULL OR STU.KHOA IN UTILS_SPLIT_FILTER(listFaculty))
                  AND (listFromCity IS NULL OR STU.THUONG_TRU_MA_TINH IN UTILS_SPLIT_FILTER(listFromCity))
                  AND (listKhoaSinhVien IS NULL OR STU.NAM_TUYEN_SINH IN UTILS_SPLIT_FILTER(listKhoaSinhVien))
                  AND (listEthnic IS NULL OR STU.DAN_TOC IN UTILS_SPLIT_FILTER(listEthnic))
                  AND (listNationality IS NULL OR STU.QUOC_GIA IN UTILS_SPLIT_FILTER(listNationality))
                  AND (listReligion IS NULL OR STU.DAN_TOC IN UTILS_SPLIT_FILTER(listReligion))
                  AND
                     (listLoaiHinhDaoTao IS NULL OR STU.LOAI_HINH_DAO_TAO IN UTILS_SPLIT_FILTER(listLoaiHinhDaoTao))
                  AND (listLoaiSinhVien IS NULL OR STU.LOAI_SINH_VIEN IN UTILS_SPLIT_FILTER(listLoaiSinhVien))
                  AND (listTinhTrangSinhVien IS NULL OR STU.TINH_TRANG IN UTILS_SPLIT_FILTER(listTinhTrangSinhVien))
                  AND (gender IS NOT NULL AND (0 || STU.GIOI_TINH) = gender OR gender IS NULL)
                  AND ((fromNhapHoc IS NOT NULL AND toNhapHoc IS NOT NULL AND fromNhapHoc < STU.NGAY_NHAP_HOC AND
                        STU.NGAY_NHAP_HOC < toNhapHoc) OR toNhapHoc IS NULL OR fromNhapHoc IS NULL)
                  )
                AND (searchTerm = ''
                  OR LOWER(STU.MSSV) = LOWER(searchTerm)
                  OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE ST
                  OR LOWER(STU.MA_NGANH) LIKE ST
                  OR LOWER(STU.LOP) LIKE ST
                  OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE ST
                  OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE ST
                  OR LOWER(STU.EMAIL_CA_NHAN) LIKE ST)

              ORDER BY CASE
                           WHEN sortMode = 'ASC' THEN
                               DECODE(sortKey, 'mssv', NLSSORT(STU.MSSV, 'NLS_SORT = BINARY_AI'), 'ho',
                                      NLSSORT(STU.HO, 'NLS_SORT = VIETNAMESE'), 'ten',
                                      NLSSORT(STU.TEN, 'NLS_SORT = VIETNAMESE'), 'ngaySinh',
                                      NLSSORT(STU.NGAY_SINH, 'NLS_SORT = BINARY_AI'), 'ngayNhapHoc',
                                      NLSSORT(STU.NGAY_NHAP_HOC, 'NLS_SORT = BINARY_AI'), 'namTuyenSinh',
                                      NLSSORT(STU.NAM_TUYEN_SINH, 'NLS_SORT = BINARY_AI'),
                                      NLSSORT(STU.TEN, 'NLS_SORT = VIETNAMESE'))
                           END ASC NULLS LAST,

                       CASE
                           WHEN sortMode = 'DESC' THEN
                               DECODE(sortKey, 'mssv', NLSSORT(STU.MSSV, 'NLS_SORT = BINARY_AI'), 'ho',
                                      NLSSORT(STU.HO, 'NLS_SORT = VIETNAMESE'), 'ten',
                                      NLSSORT(STU.TEN, 'NLS_SORT = VIETNAMESE'), 'ngaySinh',
                                      NLSSORT(STU.NGAY_SINH, 'NLS_SORT = BINARY_AI'), 'ngayNhapHoc',
                                      NLSSORT(STU.NGAY_NHAP_HOC, 'NLS_SORT = BINARY_AI'), 'namTuyenSinh',
                                      NLSSORT(STU.NAM_TUYEN_SINH, 'NLS_SORT = BINARY_AI'),
                                      NLSSORT(STU.TEN, 'NLS_SORT = VIETNAMESE'))
                           END DESC NULLS LAST)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;

    RETURN STUDENT_INFO;
end;

/
--EndMethod--