CREATE OR REPLACE FUNCTION "COMPONENT_CREATE_NEW" (
    class_name   IN   NVARCHAR2,
    style        IN   NVARCHAR2,
    view_type    IN   NVARCHAR2,
    view_id      IN   NUMBER,
    detail      IN NVARCHAR2
) RETURN NUMBER IS
    maxpriority   NUMBER;
    last_id       fw_home_component.id%TYPE;
BEGIN
    BEGIN
        SELECT
            MAX(priority)
        INTO maxpriority
        FROM
            fw_home_component;

    EXCEPTION
        WHEN no_data_found THEN
            maxpriority := 0;
    END;

    IF maxpriority IS NULL THEN
        maxpriority := 0;
    END IF;
    maxpriority := maxpriority + 1;
    INSERT INTO fw_home_component (
        class_name,
        style,
        view_type,
        view_id,
        detail,
        priority
    ) VALUES (
        class_name,
        style,
        view_type,
        view_id,
        detail,
        maxpriority
    ) RETURNING id INTO last_id;

    COMMIT;
    RETURN last_id;
END component_create_new;
/
--EndMethod--

CREATE OR REPLACE FUNCTION CONTACT_SEARCH_PAGE(page_number IN OUT NUMBER, page_size IN OUT NUMBER, read_state In NUMBER, search_term IN STRING, total_item OUT NUMBER, page_total OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(search_term) || '%';
BEGIN
    SELECT COUNT(*)
    INTO total_item
    FROM FW_CONTACT
    WHERE (read_state = -1 OR read_state = READ) and (
        search_term = ''
        OR LOWER(NAME) LIKE sT
        OR LOWER(EMAIL) LIKE sT
        OR LOWER(SUBJECT) LIKE sT
        OR LOWER(MESSAGE) LIKE sT
    );

    IF page_number < 1 THEN page_number := 1; END IF;
    IF page_size < 1 THEN page_size := 1; END IF;
    page_total := CEIL(total_item / page_size);
    page_number := LEAST(page_number, page_total);

    OPEN my_cursor FOR
        SELECT *
        FROM (
            SELECT NAME                         AS  "name",
                   EMAIL                        AS  "email",
                   SUBJECT                      AS  "subject",
--                    MESSAGE                      AS  "message",
                   READ                         AS  "read",
                   CREATED_DATE                 AS  "createdDate",
                   ID                           AS  "id",
                   ROW_NUMBER() OVER (ORDER BY ID DESC) R
            FROM FW_CONTACT
            WHERE (read_state = -1 OR read_state = READ) and (
                search_term = ''
                OR LOWER(NAME) LIKE sT
                OR LOWER(EMAIL) LIKE sT
                OR LOWER(SUBJECT) LIKE sT
                OR LOWER(MESSAGE) LIKE sT
            )
        ) WHERE R BETWEEN (page_number - 1) * page_size + 1 AND  page_number * page_size;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DM_LINH_VUC_KINH_DOANH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DM_LINH_VUC_KINH_DOANH LV
    WHERE searchTerm = ''
       OR LOWER(TRIM(TEN)) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT LV.MA                        AS  "ma",
                    LV.TEN                          AS  "ten",
                    LV.MO_TA                        AS  "moTa",
                    LV.KICH_HOAT                    AS  "kichHoat",
                    ROW_NUMBER() OVER (ORDER BY MA DESC) R
                FROM DM_LINH_VUC_KINH_DOANH LV
                WHERE searchTerm = ''
                    OR LOWER(TRIM(TEN)) LIKE sT
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DOWNLOAD_EXCEL_QT_HOP_DONG_LAO_DONG(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                    searchTerm IN STRING, totalItem OUT NUMBER,
                                                    pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(502) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM QT_HOP_DONG_LAO_DONG HD
             LEFT JOIN TCHC_CAN_BO cb ON HD.NGUOI_DUOC_THUE = cb.SHCC
    WHERE HD.NGUOI_DUOC_THUE IN (
        SELECT tcb.SHCC
        FROM TCHC_CAN_BO tcb
        WHERE (
                          searchTerm = '' OR tcb.SHCC LIKE sT OR LOWER(TRIM(tcb.ho || ' ' || tcb.ten)) LIKE sT
                  )
    );
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT CBK.HO                  AS                                               "hoNguoiKy",
                        CBK.TEN                 AS                                               "tenNguoiKy",
                        CBK.MA_CHUC_VU          AS                                               "maChucVuNguoiKy",
                        CV.TEN                  AS                                               "chucVuNguoiKy",
                        DVK.TEN                 AS                                               "donViNguoiKy",
                        HD.NGUOI_DUOC_THUE      AS                                               "shcc",
                        HD.SO_HOP_DONG          AS                                               "soHopDong",
                        CB.HO                   AS                                               "ho",
                        CB.TEN                  AS                                               "ten",
                        CB.CMND                 AS                                               "cmnd",
                        CB.CMND_NGAY_CAP        AS                                               "ngayCap",
                        CB.CMND_NOI_CAP         AS                                               "noiCap",
                        CB.PHAI                 AS                                               "phai",
                        GTinh.TEN               AS                                               "gioiTinh",
                        CB.DIEN_THOAI_CA_NHAN   AS                                               "dienThoai",
                        CB.EMAIL                AS                                               "email",
                        CB.NGAY_SINH            AS                                               "ngaySinh",
                        TP1.TEN                 AS                                               "noiSinh",
                        TP2.TEN                 AS                                               "nguyenQuan",
                        TP3.TEN                 AS                                               "tinhCuTru",
                        TP4.TEN                 AS                                               "tinhThuongTru",
                        QH1.TEN_QUAN_HUYEN      AS                                               "huyenCuTru",
                        QH2.TEN_QUAN_HUYEN      AS                                               "huyenThuongTru",
                        PX1.TEN_PHUONG_XA       AS                                               "xaCuTru",
                        PX2.TEN_PHUONG_XA       AS                                               "xaThuongTru",
                        CB.HIEN_TAI_SO_NHA      AS                                               "soNhaCuTru",
                        CB.THUONG_TRU_SO_NHA    AS                                               "soNhaThuongTru",
                        TDHV.TEN                AS                                               "trinhDoHocVan",
                        CB.CHUYEN_NGANH         AS                                               "hocVanChuyenNganh",
                        DT.TEN                  AS                                               "danToc",
                        TG.TEN                  AS                                               "tonGiao",
                        QT.TEN_QUOC_GIA         AS                                               "quocTich",
                        LHD.TEN                 AS                                               "loaiHopDong",
                        HD.NGAY_KY_HOP_DONG     AS                                               "ngayKyHopDong",
                        HD.BAT_DAU_LAM_VIEC     AS                                               "batDauLamViec",
                        HD.NGAY_KY_HD_TIEP_THEO AS                                               "ngayKyHdTiepTheo",
                        HD.KET_THUC_HOP_DONG    AS                                               "ketThucHopDong",
                        DV3.TEN                 AS                                               "diaDiemLamViec",
                        CDCM.TEN                AS                                               "chucDanhChuyenMon",
                        HD.CHIU_SU_PHAN_CONG    AS                                               "chiuSuPhanCong",
                        ngach.TEN               AS                                               "ngach",
                        HD.BAC                  AS                                               "bac",
                        HD.HE_SO                AS                                               "heSo",
                        HD.PHAN_TRAM_HUONG      AS                                               "phanTramHuong",

                        ROW_NUMBER() OVER (ORDER BY CB.TEN ASC,CB.HO ASC,HD.NGUOI_DUOC_THUE ASC) R
                 FROM QT_HOP_DONG_LAO_DONG HD
                          LEFT JOIN TCHC_CAN_BO CB ON HD.NGUOI_DUOC_THUE = CB.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG LHD ON HD.LOAI_HOP_DONG = LHD.MA
                          LEFT JOIN DM_DAN_TOC DT ON CB.DAN_TOC = DT.MA
                          LEFT JOIN DM_TON_GIAO TG ON CB.TON_GIAO = TG.MA
                          LEFT JOIN DM_GIOI_TINH GTinh ON CB.PHAI = GTinh.MA
                          LEFT JOIN DM_QUOC_GIA QT ON CB.QUOC_GIA = QT.MA_CODE
                          LEFT JOIN DM_NGACH_CDNN ngach ON HD.NGACH = ngach.ID
                          LEFT JOIN DM_TRINH_DO TDHV ON CB.TRINH_DO_PHO_THONG = TDHV.MA
                          LEFT JOIN DM_TINH_THANH_PHO TP1 ON CB.MA_TINH_NOI_SINH = TP1.MA
                          LEFT JOIN DM_TINH_THANH_PHO TP2 ON CB.MA_TINH_NGUYEN_QUAN = TP2.MA
                          LEFT JOIN TCHC_CAN_BO CBK ON HD.NGUOI_KY = CBK.SHCC
                          LEFT JOIN DM_CHUC_VU CV ON CBK.MA_CHUC_VU = CV.MA
                          LEFT JOIN DM_DON_VI DVK ON CBK.MA_DON_VI = DVK.MA
                          LEFT JOIN DM_DON_VI DV2 ON CBK.MA_DON_VI = DV2.MA
                          LEFT JOIN DM_DON_VI DV3 ON HD.DIA_DIEM_LAM_VIEC = DV3.MA
                          LEFT JOIN DM_CHUC_DANH_KHOA_HOC CDKH ON CB.CHUC_DANH = CDKH.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON CDCM ON HD.CHUC_DANH_CHUYEN_MON = CDCM.MA
                          LEFT JOIN DM_TINH_THANH_PHO TP3 ON CB.HIEN_TAI_MA_TINH = TP3.MA
                          LEFT JOIN DM_QUAN_HUYEN QH1
                                    ON CB.HIEN_TAI_MA_HUYEN = QH1.MA_TINH_THANH_PHO AND
                                       CB.HIEN_TAI_MA_HUYEN = QH1.MA_QUAN_HUYEN
                          LEFT JOIN DM_PHUONG_XA PX1
                                    ON CB.HIEN_TAI_MA_HUYEN = PX1.MA_QUAN_HUYEN AND CB.HIEN_TAI_MA_XA = PX1.MA_PHUONG_XA
                          LEFT JOIN DM_TINH_THANH_PHO TP4 ON CB.THUONG_TRU_MA_TINH = TP4.MA
                          LEFT JOIN DM_QUAN_HUYEN QH2 ON CB.THUONG_TRU_MA_TINH = QH2.MA_TINH_THANH_PHO AND
                                                         CB.THUONG_TRU_MA_HUYEN = QH2.MA_QUAN_HUYEN
                          LEFT JOIN DM_PHUONG_XA PX2
                                    ON CB.THUONG_TRU_MA_HUYEN = PX2.MA_QUAN_HUYEN AND
                                       CB.THUONG_TRU_MA_XA = PX2.MA_PHUONG_XA
                 WHERE HD.NGUOI_DUOC_THUE IN (
                     SELECT tcb.SHCC
                     FROM TCHC_CAN_BO tcb
                     WHERE (
                                       searchTerm = '' OR tcb.SHCC LIKE sT OR
                                       LOWER(TRIM(tcb.ho || ' ' || tcb.ten)) LIKE sT
                               )
                 )
                 ORDER BY CB.TEN ASC, CB.HO ASC, HD.NGUOI_DUOC_THUE ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DOWNLOAD_EXCEL_QT_KHEN_THUONG_ALL(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                    loaiDoiTuong IN STRING, maDoiTuong IN STRING,
                                                    fromYear IN STRING, toYear IN STRING,
                                                    totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM QT_KHEN_THUONG_ALL qtkta
                LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
                LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
                LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
                LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
                LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
    WHERE (loaiDoiTuong = '-1'
        OR (qtkta.LOAI_DOI_TUONG = loaiDoiTuong and maDoiTuong = '-1')
        OR (qtkta.LOAI_DOI_TUONG = loaiDoiTuong and qtkta.MA = maDoiTuong))
        AND (fromYear = '$$$$' OR qtkta.NAM_DAT_DUOC IS NULL OR TO_NUMBER(qtkta.NAM_DAT_DUOC) >= TO_NUMBER(fromYear))
        AND (toYear = '$$$$' OR qtkta.NAM_DAT_DUOC IS NULL OR TO_NUMBER(qtkta.NAM_DAT_DUOC) <= TO_NUMBER(toYear));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA           AS                "ma",
                        qtkta.ID           AS                "id",
                        qtkta.nam_dat_duoc AS                "namDatDuoc",
                        qtkta.DIEM_THI_DUA AS                "diemThiDua",

                        ldt.MA             AS                "maLoaiDoiTuong",
                        ldt.TEN            AS                "tenLoaiDoiTuong",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        bm.MA              AS                "maBoMon",
                        bm.TEN             AS                "tenBoMon",
                        bm.MA_DV           AS                "maDonViBoMon",
                        dv2.TEN            AS                "tenDonViBoMon",

                        ktkh.MA            AS                "maThanhTich",
                        ktkh.TEN           AS                "tenThanhTich",

                        ktct.MA            AS                "maChuThich",
                        ktct.TEN           AS                "tenChuThich",
                        ROW_NUMBER() OVER (ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC) R

                 FROM QT_KHEN_THUONG_ALL qtkta
                          LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                          LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                          LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
                          LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
                          LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
                          LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
                              LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
                WHERE (loaiDoiTuong = '-1'
                    OR (qtkta.LOAI_DOI_TUONG = loaiDoiTuong and maDoiTuong = '-1')
                    OR (qtkta.LOAI_DOI_TUONG = loaiDoiTuong and qtkta.MA = maDoiTuong))
                    AND (fromYear = '$$$$' OR qtkta.NAM_DAT_DUOC IS NULL OR TO_NUMBER(qtkta.NAM_DAT_DUOC) >= TO_NUMBER(fromYear))
                    AND (toYear = '$$$$' OR qtkta.NAM_DAT_DUOC IS NULL OR TO_NUMBER(qtkta.NAM_DAT_DUOC) <= TO_NUMBER(toYear))
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DOWNLOAD_HOP_DONG_DVTL_TN(maHd IN NUMBER) RETURN SYS_REFCURSOR
AS
    HOP_DONG SYS_REFCURSOR;
BEGIN
    OPEN HOP_DONG FOR
        SELECT CBK.HO                   AS "hoNguoiKy",
               HD.SO_HOP_DONG           AS "soHopDong",
               CBK.TEN                  AS "tenNguoiKy",
               CBK.MA_CHUC_VU           AS "maChucVuNguoiKy",
               DV2.TEN                  AS "donViNguoiKy",
               CV.TEN                   AS "chucVuNguoiKy",
               HD.NGUOI_DUOC_THUE       AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               CB.CMND                  AS "cmnd",
               CB.CMND_NGAY_CAP         AS "ngayCap",
               CB.CMND_NOI_CAP          AS "cmndNoiCap",
               CB.GIOI_TINH             AS "phai",
               CB.DIEN_THOAI            AS "dienThoai",
               CB.EMAIL                 AS "email",
               CB.NGAY_SINH             AS "ngaySinh",
               TP1.TEN                  AS "noiSinh",
               TP2.TEN                  AS "nguyenQuan",
               TP3.TEN                  AS "tinhCuTru",
               TP4.TEN                  AS "tinhThuongTru",
               QH1.TEN_QUAN_HUYEN       AS "huyenCuTru",
               QH2.TEN_QUAN_HUYEN       AS "huyenThuongTru",
               PX1.TEN_PHUONG_XA        AS "xaCuTru",
               PX2.TEN_PHUONG_XA        AS "xaThuongTru",
               CB.CU_TRU_SO_NHA         AS "soNhaCuTru",
               CB.THUONG_TRU_SO_NHA     AS "thuongTruSoNha",
               TDHV.TEN                 AS "trinhDoHocVan",
               CDKH.TEN                 AS "chucDanhKhoaHoc",
               CB.KHOA_HOC_CHUYEN_NGANH AS "khoaHocChuyenNganh",
               CB.HOC_VAN_CHUYEN_NGANH  AS "hocVanChuyenNganh",
               DT.TEN                   AS "danToc",
               TG.TEN                   AS "tonGiao",
               QT.TEN_QUOC_GIA          AS "quocTich",

               LHD.TEN                  AS "loaiHopDong",
               HD.HIEU_LUC_HOP_DONG     AS "hieuLucHopDong",
               HD.NGAY_KY_HOP_DONG      AS "ngayKyHopDong",
               HD.KET_THUC_HOP_DONG     AS "ketThucHopDong",
               DV3.TEN                  AS "diaDiemLamViec",
               CDCM.TEN                 AS "chucDanhChuyenMon",
               HD.CHIU_SU_PHAN_CONG     AS "chiuSuPhanCong",
               NG.TEN                 AS "ngach",
               HD.BAC                   AS "bac",
               HD.HE_SO                 AS "heSo",
               HD.TIEN_LUONG            AS "tienLuong",
               DV.TEN                   AS "donViChiTra"

        FROM QT_HOP_DONG_DVTL_TN HD
                 LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN CB ON HD.NGUOI_DUOC_THUE = CB.SHCC
                 LEFT JOIN DM_LOAI_HOP_DONG LHD ON HD.LOAI_HOP_DONG = LHD.MA
                 LEFT JOIN DM_DAN_TOC DT ON CB.DAN_TOC = DT.MA
                 LEFT JOIN DM_TON_GIAO TG ON CB.TON_GIAO = TG.MA
                 LEFT JOIN DM_QUOC_GIA QT ON CB.QUOC_GIA = QT.MA_CODE
                 LEFT JOIN DM_DON_VI DV ON HD.DON_VI_CHI_TRA = DV.MA

                 LEFT JOIN DM_NGACH_CDNN NG ON HD.NGACH = NG.ID
                 LEFT JOIN DM_TRINH_DO TDHV ON CB.HOC_VAN_TRINH_DO = TDHV.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP1 ON CB.NOI_SINH_MA_TINH = TP1.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP2 ON CB.NGUYEN_QUAN_MA_TINH = TP2.MA
                 LEFT JOIN TCHC_CAN_BO CBK ON HD.NGUOI_KY = CBK.SHCC
                 LEFT JOIN DM_CHUC_VU CV ON CBK.MA_CHUC_VU = CV.MA
                 LEFT JOIN DM_DON_VI DV2 ON CBK.MA_DON_VI = DV2.MA
                 LEFT JOIN DM_DON_VI DV3 ON HD.DIA_DIEM_LAM_VIEC = DV3.MA
                 LEFT JOIN DM_CHUC_DANH_KHOA_HOC CDKH ON CB.KHOA_HOC_CHUC_DANH = CDKH.MA
                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON CDCM ON HD.CHUC_DANH_CHUYEN_MON = CDCM.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP3 ON CB.CU_TRU_MA_TINH = TP3.MA
                 LEFT JOIN DM_QUAN_HUYEN QH1
                           ON CB.CU_TRU_MA_TINH = QH1.MA_TINH_THANH_PHO AND CB.CU_TRU_MA_HUYEN = QH1.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX1
                           ON CB.CU_TRU_MA_HUYEN = PX1.MA_QUAN_HUYEN AND CB.CU_TRU_MA_XA = PX1.MA_PHUONG_XA
                 LEFT JOIN DM_TINH_THANH_PHO TP4 ON CB.THUONG_TRU_MA_TINH = TP4.MA
                 LEFT JOIN DM_QUAN_HUYEN QH2 ON CB.THUONG_TRU_MA_TINH = QH2.MA_TINH_THANH_PHO AND
                                                CB.THUONG_TRU_MA_HUYEN = QH2.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX2
                           ON CB.THUONG_TRU_MA_HUYEN = PX2.MA_QUAN_HUYEN AND CB.THUONG_TRU_MA_XA = PX2.MA_PHUONG_XA
        WHERE HD.MA = maHd;
    RETURN HOP_DONG;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DOWNLOAD_HOP_DONG_LAO_DONG(maHd IN NUMBER) RETURN SYS_REFCURSOR
AS
    HOP_DONG SYS_REFCURSOR;
BEGIN
    OPEN HOP_DONG FOR
        SELECT CBK.HO                AS "hoNguoiKy",
               CBK.TEN               AS "tenNguoiKy",
               CBK.MA_CHUC_VU        AS "maChucVuNguoiKy",
               CV.TEN                AS "chucVuNguoiKy",
               DVK.TEN               AS "donViNguoiKy",
               HD.NGUOI_DUOC_THUE    AS "shcc",
               HD.SO_HOP_DONG        AS "soHopDong",
               CB.HO                 AS "ho",
               CB.TEN                AS "ten",
               CB.CMND               AS "cmnd",
               CB.CMND_NGAY_CAP      AS "ngayCap",
               CB.CMND_NOI_CAP       AS "cmndNoiCap",
               CB.PHAI               AS "phai",
               CB.DIEN_THOAI_CA_NHAN AS "dienThoai",
               CB.EMAIL              AS "email",
               CB.NGAY_SINH          AS "ngaySinh",
               TP1.TEN               AS "noiSinh",
               TP2.TEN               AS "nguyenQuan",
               TP3.TEN               AS "tinhCuTru",
               TP4.TEN               AS "tinhThuongTru",
               QH1.TEN_QUAN_HUYEN    AS "huyenCuTru",
               QH2.TEN_QUAN_HUYEN    AS "huyenThuongTru",
               PX1.TEN_PHUONG_XA     AS "xaCuTru",
               PX2.TEN_PHUONG_XA     AS "xaThuongTru",
               CB.HIEN_TAI_SO_NHA    AS "soNhaCuTru",
               CB.THUONG_TRU_SO_NHA  AS "soNhaThuongTru",
               TDHV.TEN              AS "trinhDoHocVan",
               CB.CHUYEN_NGANH       AS "hocVanChuyenNganh",
               DT.TEN                AS "danToc",
               TG.TEN                AS "tonGiao",
               QT.TEN_QUOC_GIA       AS "quocTich",
               LHD.TEN               AS "loaiHopDong",
               HD.NGAY_KY_HOP_DONG   AS "ngayKyHopDong",
               HD.KET_THUC_HOP_DONG  AS "ketThucHopDong",
               DV3.TEN               AS "diaDiemLamViec",
               CDCM.TEN              AS "chucDanhChuyenMon",
               HD.CHIU_SU_PHAN_CONG  AS "chiuSuPhanCong",
               HD.NGACH              AS "ngach",
               NG.TEN                AS "tenNgach",
               HD.BAC                AS "bac",
               HD.HE_SO              AS "heSo",
               HD.PHAN_TRAM_HUONG    AS "phanTramHuong"

        FROM QT_HOP_DONG_LAO_DONG HD
                 LEFT JOIN TCHC_CAN_BO CB ON HD.NGUOI_DUOC_THUE = CB.SHCC
                 LEFT JOIN DM_LOAI_HOP_DONG LHD ON HD.LOAI_HOP_DONG = LHD.MA
                 LEFT JOIN DM_DAN_TOC DT ON CB.DAN_TOC = DT.MA
                 LEFT JOIN DM_TON_GIAO TG ON CB.TON_GIAO = TG.MA
                 LEFT JOIN DM_QUOC_GIA QT ON CB.QUOC_GIA = QT.MA_CODE
                 LEFT JOIN DM_NGACH_CDNN NG ON HD.NGACH = NG.ID
                 LEFT JOIN DM_TRINH_DO TDHV ON CB.TRINH_DO_PHO_THONG = TDHV.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP1 ON CB.MA_TINH_NOI_SINH = TP1.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP2 ON CB.MA_TINH_NGUYEN_QUAN = TP2.MA
                 LEFT JOIN TCHC_CAN_BO CBK ON HD.NGUOI_KY = CBK.SHCC
                 LEFT JOIN DM_CHUC_VU CV ON CBK.MA_CHUC_VU = CV.MA
                 LEFT JOIN DM_DON_VI DVK ON CBK.MA_DON_VI = DVK.MA
                 LEFT JOIN DM_DON_VI DV2 ON CBK.MA_DON_VI = DV2.MA
                 LEFT JOIN DM_DON_VI DV3 ON HD.DIA_DIEM_LAM_VIEC = DV3.MA
                 LEFT JOIN DM_CHUC_DANH_KHOA_HOC CDKH ON CB.CHUC_DANH = CDKH.MA
                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON CDCM ON HD.CHUC_DANH_CHUYEN_MON = CDCM.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP3 ON CB.HIEN_TAI_MA_TINH = TP3.MA
                 LEFT JOIN DM_QUAN_HUYEN QH1
                           ON CB.HIEN_TAI_MA_HUYEN = QH1.MA_TINH_THANH_PHO AND CB.HIEN_TAI_MA_HUYEN = QH1.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX1
                           ON CB.HIEN_TAI_MA_HUYEN = PX1.MA_QUAN_HUYEN AND CB.HIEN_TAI_MA_XA = PX1.MA_PHUONG_XA
                 LEFT JOIN DM_TINH_THANH_PHO TP4 ON CB.THUONG_TRU_MA_TINH = TP4.MA
                 LEFT JOIN DM_QUAN_HUYEN QH2 ON CB.THUONG_TRU_MA_TINH = QH2.MA_TINH_THANH_PHO AND
                                                CB.THUONG_TRU_MA_HUYEN = QH2.MA_QUAN_HUYEN
                 LEFT JOIN DM_PHUONG_XA PX2
                           ON CB.THUONG_TRU_MA_HUYEN = PX2.MA_QUAN_HUYEN AND CB.THUONG_TRU_MA_XA = PX2.MA_PHUONG_XA
        WHERE HD.MA = maHd;
    RETURN HOP_DONG;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_gioi_thieu_create_new_item (p_maDonVi in nvarchar2, p_ten in nvarchar2, p_noiDung in clob, p_trongSo in number,  p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_GIOI_THIEU.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_GIOI_THIEU where MA_DON_VI=p_maDonVi;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_GIOI_THIEU (ma_don_vi, ten, thu_tu, noi_dung, trong_so, kich_hoat) values (p_maDonVi, p_ten, maxThuTu, p_noiDung, p_trongSo, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_gioi_thieu_hinh_create_new_item (p_link in nvarchar2, p_maWebsiteGioiThieu in nvarchar2, p_image in nvarchar2, p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_GIOI_THIEU_HINH.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_GIOI_THIEU_HINH where MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_GIOI_THIEU_HINH (thu_tu, link, ma_website_gioi_thieu, image, kich_hoat) values (maxThuTu, p_link, p_maWebsiteGioiThieu, p_image, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE procedure dv_website_gioi_thieu_hinh_swap_thu_tu(p_id in number, p_is_move_up in number, p_maWebsiteGioiThieu in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_GIOI_THIEU_HINH where MA=p_id and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU_HINH where THU_TU>thuTu1 and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu order by THU_TU asc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU_HINH where THU_TU<thuTu1 and MA_WEBSITE_GIOI_THIEU=p_maWebsiteGioiThieu order by THU_TU desc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_GIOI_THIEU_HINH set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_GIOI_THIEU_HINH set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE procedure dv_website_gioi_thieu_swap_thu_tu(p_id in number, p_is_move_up in number, p_maDonVi in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_GIOI_THIEU where MA=p_id and MA_DON_VI=p_maDonVi ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU where THU_TU<thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU desc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_GIOI_THIEU where THU_TU>thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU asc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_GIOI_THIEU set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_GIOI_THIEU set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION dv_website_hinh_create_new_item (p_maDonVi in nvarchar2, p_image in nvarchar2, p_tieuDe in nvarchar2, p_link in nvarchar2,  p_kichHoat in number) RETURN NUMBER
IS
    maxThuTu number;
    last_id DV_WEBSITE_HINH.ma%TYPE;
BEGIN
    begin
        select MAX(THU_TU) into maxThuTu from DV_WEBSITE_HINH where MA_DON_VI=p_maDonVi;
    exception
        when NO_DATA_FOUND then
        maxThuTu := 0;
    end;
    if maxThuTu is null then
        maxThuTu := 0;
    end if;
    maxThuTu := maxThuTu+1;

    insert into DV_WEBSITE_HINH (ma_don_vi, image, tieu_de, link, thu_tu, kich_hoat) values (p_maDonVi, p_image, p_tieuDe, p_link, maxThuTu, p_kichHoat)
    returning ma into last_id;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE procedure dv_website_hinh_swap_thu_tu(p_id in number, p_is_move_up in number, p_maDonVi in nvarchar2)
IS
    thuTu1 number;
    thuTu2 number;
    id2 number;
BEGIN
    begin
        select THU_TU into thuTu1 from DV_WEBSITE_HINH where MA=p_id and MA_DON_VI=p_maDonVi ;

        if p_is_move_up=1 then
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_HINH where THU_TU>thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU asc
                fetch first 1 row only;
        else
            select MA,THU_TU into id2,thuTu2 from DV_WEBSITE_HINH where THU_TU<thuTu1 and MA_DON_VI=p_maDonVi order by THU_TU desc
                fetch first 1 row only;
        end if;

        if id2 is not null then
            update DV_WEBSITE_HINH set THU_TU=thuTu2 where MA=p_id;
            update DV_WEBSITE_HINH set THU_TU=thuTu1 where MA=id2;
        end if;
    exception
        when NO_DATA_FOUND then
        thuTu1 := -1;
    end;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION DV_WEBSITE_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM DV_WEBSITE ws
             LEFT JOIN DM_DON_VI dv on ws.MA_DON_VI = dv.MA
    WHERE searchTerm = ''
        OR LOWER(ws.SHORTNAME) LIKE sT
        OR LOWER(dv.TEN) LIKE sT;

    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                SELECT  ws.SHORTNAME                         AS  "shortname",
                        ws.KICH_HOAT                         AS  "kichHoat",
                        ws.WEBSITE                           AS  "website",
                        ws.MA_DON_VI                         AS  "maDonVi",
                        dv.TEN                               AS  "tenDonVi",
                        ROW_NUMBER() OVER (ORDER BY ws.SHORTNAME DESC) R
                FROM DV_WEBSITE ws

                    LEFT JOIN DM_DON_VI dv on ws.MA_DON_VI = dv.MA

                WHERE searchTerm = ''
                OR LOWER(ws.SHORTNAME) LIKE sT
                OR LOWER(dv.TEN) LIKE sT
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION "FW_USER_GET_USER_ROLES" (pemail in nvarchar2)
RETURN SYS_REFCURSOR
AS
my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT fw_role.id as "id", fw_role.name as "name", fw_role.permission as "permission"
        FROM fw_user_role, fw_role
        WHERE fw_user_role.email=pemail AND fw_user_role.role_id=fw_role.id AND fw_role.active=1;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE PROCEDURE home_footer_swap_priority (p_ma in NUMBER, p_thu_tu in number, p_is_up in number)
IS
BEGIN
    IF p_is_up=1 THEN
        UPDATE FW_HOME_FOOTER SET PRIORITY=PRIORITY+1 WHERE PRIORITY >= p_thu_tu;
    ELSE
        UPDATE FW_HOME_FOOTER SET PRIORITY=PRIORITY-1 WHERE PRIORITY <= p_thu_tu;
    END IF;
    UPDATE FW_HOME_FOOTER SET PRIORITY=p_thu_tu WHERE ID=p_ma;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION menu_create_default (parent_id in number, title in nvarchar2, link in nvarchar2, active in number,maDonVi in nvarchar2,maWebsite in nvarchar2) RETURN NUMBER
IS
    maxPriority number;
    last_id FW_HOME_MENU.id%TYPE;
BEGIN
    begin
        select MAX(PRIORITY) into maxPriority from FW_HOME_MENU;
    exception
        when NO_DATA_FOUND then
        maxPriority := 0;
    end;
    if maxPriority is null then
        maxPriority := 0;
    end if;
    maxPriority := maxPriority+1;

    if parent_id is null then
        insert into FW_HOME_MENU (title, link, active,MA_DON_VI,MA_WEBSITE, priority) values (title, link, active, maDonVi,maWebsite, maxPriority)
        returning id into last_id;
    else
        insert into FW_HOME_MENU (parent_id, title, link, active,MA_DON_VI,MA_WEBSITE, priority) values (parent_id, title, link, active,maDonVi,maWebsite, maxPriority)
        returning id into last_id;
    end if;

    commit;
    return last_id;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_BAI_VIET_KHOA_HOC
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAI_VIET_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtbvkh
             LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
       OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbvkh.ID           AS                "id",
                        qtbvkh.TEN_TAC_GIA  AS "tenTacGia",
                        qtbvkh.NAM_XUAT_BAN AS "namXuatBan",
                        qtbvkh.TEN_BAI_VIET AS "tenBaiViet",
                        qtbvkh.TEN_TAP_CHI  AS "tenTapChi",
                        qtbvkh.SO_HIEU_ISSN AS "soHieuIssn",
                        qtbvkh.SAN_PHAM AS "sanPham",
                        qtbvkh.DIEM_IF  AS "diemIf",
                        qtbvkh.QUOC_TE  AS "quocTe",
                        qtbvkh.SHCC AS "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM (SELECT *
                      FROM QT_BAI_VIET_KHOA_HOC
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAI_VIET_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtbvkh
                         LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
                   OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT)
                ORDER BY qtbvkh.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAI_VIET_KHOA_HOC qtbvkh
         LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtbvkh.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbvkh.ID           AS                "id",
                        qtbvkh.TEN_TAC_GIA  AS "tenTacGia",
                        qtbvkh.NAM_XUAT_BAN AS "namXuatBan",
                        qtbvkh.TEN_BAI_VIET AS "tenBaiViet",
                        qtbvkh.TEN_TAP_CHI  AS "tenTapChi",
                        qtbvkh.SO_HIEU_ISSN AS "soHieuIssn",
                        qtbvkh.SAN_PHAM AS "sanPham",
                        qtbvkh.DIEM_IF  AS "diemIf",
                        qtbvkh.QUOC_TE  AS "quocTe",
                        qtbvkh.SHCC AS "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM QT_BAI_VIET_KHOA_HOC qtbvkh
                     LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                     LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtbvkh.SHCC = searchTerm)
                ORDER BY qtbvkh.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAI_VIET_KHOA_HOC qtbvkh
             LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
       OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbvkh.ID           AS                "id",
                        qtbvkh.TEN_TAC_GIA  AS "tenTacGia",
                        qtbvkh.NAM_XUAT_BAN AS "namXuatBan",
                        qtbvkh.TEN_BAI_VIET AS "tenBaiViet",
                        qtbvkh.TEN_TAP_CHI  AS "tenTapChi",
                        qtbvkh.SO_HIEU_ISSN AS "soHieuIssn",
                        qtbvkh.SAN_PHAM AS "sanPham",
                        qtbvkh.DIEM_IF  AS "diemIf",
                        qtbvkh.QUOC_TE  AS "quocTe",
                        qtbvkh.SHCC AS "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM QT_BAI_VIET_KHOA_HOC qtbvkh
                         LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
                   OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT)
                ORDER BY qtbvkh.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
         SELECT
                bhxh.ID             as  "id",
                bhxh.BAT_DAU        as  "batDau",
                bhxh.BAT_DAU_TYPE   as  "batDauType",
                bhxh.KET_THUC       as  "ketThuc",
                bhxh.KET_THUC_TYPE  as  "ketThucType",
                bhxh.CHUC_VU        as  "chucVu",
                bhxh.MUC_DONG       as  "mucDong",
                bhxh.PHU_CAP_CHUC_VU    as  "phuCapChucVu",
                bhxh.PHU_CAP_THAM_NIEN_VUOT_KHUNG   as  "phuCapThamNienVuotKhung",
                bhxh.PHU_CAP_THAM_NIEN_NGHE     as  "phuCapThamNienNghe",
                bhxh.TY_LE_DONG     as  "tyLeDong",
                cv.MA               as  "maChucVu",
                cv.TEN              as  "tenChucVu",
                dv.MA              AS                       "maDonVi",
                dv.TEN             AS                       "tenDonVi",
        
                ROW_NUMBER() OVER (ORDER BY bhxh.KET_THUC DESC ) R
         FROM QT_BAO_HIEM_XA_HOI bhxh
                  LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                  LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                  LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
        WHERE bhxh.SHCC = isSHCC;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_BAO_HIEM_XA_HOI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAO_HIEM_XA_HOI ORDER BY SHCC DESC) GROUP BY SHCC)) bhxh
              LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
              LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
              LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
    WHERE (list_shcc IS NULL OR INSTR(list_shcc, bhxh.SHCC) != 0)
      AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        );

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        bhxh.ID             as  "id",
                        bhxh.SHCC           as  "shcc",
                        bhxh.BAT_DAU        as  "batDau",
                        bhxh.BAT_DAU_TYPE   as  "batDauType",
                        bhxh.KET_THUC       as  "ketThuc",
                        bhxh.KET_THUC_TYPE  as  "ketThucType",
                        bhxh.CHUC_VU        as  "chucVu",
                        bhxh.MUC_DONG       as  "mucDong",
                        bhxh.PHU_CAP_CHUC_VU    as  "phuCapChucVu",
                        bhxh.PHU_CAP_THAM_NIEN_VUOT_KHUNG   as  "phuCapThamNienVuotKhung",
                        bhxh.PHU_CAP_THAM_NIEN_NGHE     as  "phuCapThamNienNghe",
                        bhxh.TY_LE_DONG     as  "tyLeDong",
                        
                        (SELECT COUNT(*)
                         FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                         WHERE bhxh_temp.SHCC = bhxh.SHCC
                           AND (bhxh_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                                bhxh_temp.BAT_DAU >= fromYear)
                           AND (bhxh_temp.KET_THUC IS NULL OR toYear IS NULL OR
                                bhxh_temp.KET_THUC <= toYear)
                        ) AS "soQuaTrinh",

                        (Select listagg(bhxh_temp2.BAT_DAU || ' ', '??') within group ( order by null)
                         from QT_BAO_HIEM_XA_HOI bhxh_temp2
                         WHERE bhxh_temp2.SHCC = bhxh.SHCC
                           AND (bhxh_temp2.BAT_DAU IS NULL OR fromYear IS NULL OR
                                bhxh_temp2.BAT_DAU >= fromYear)
                           AND (bhxh_temp2.KET_THUC IS NULL OR toYear IS NULL OR
                                bhxh_temp2.KET_THUC <= toYear)) AS "danhSachBatDau",

                        (Select listagg(bhxh_temp3.KET_THUC || ' ', '??') within group ( order by null)
                         from QT_BAO_HIEM_XA_HOI bhxh_temp3
                         WHERE bhxh_temp3.SHCC = bhxh.SHCC
                           AND (bhxh_temp3.BAT_DAU IS NULL OR fromYear IS NULL OR
                                bhxh_temp3.BAT_DAU >= fromYear)
                           AND (bhxh_temp3.KET_THUC IS NULL OR toYear IS NULL OR
                                bhxh_temp3.KET_THUC <= toYear)) AS "danhSachKetThuc",

                        (Select listagg(bhxh_temp4.KET_THUC_TYPE || ' ', '??') within group ( order by null)
                         from QT_BAO_HIEM_XA_HOI bhxh_temp4
                         WHERE bhxh_temp4.SHCC = bhxh.SHCC
                           AND (bhxh_temp4.BAT_DAU IS NULL OR fromYear IS NULL OR
                                bhxh_temp4.BAT_DAU >= fromYear)
                           AND (bhxh_temp4.KET_THUC IS NULL OR toYear IS NULL OR
                                bhxh_temp4.KET_THUC <= toYear)) AS "danhSachKetThucType",

                        (Select listagg(bhxh_temp5.BAT_DAU_TYPE || ' ', '??') within group ( order by null)
                         from QT_BAO_HIEM_XA_HOI bhxh_temp5
                         WHERE bhxh_temp5.SHCC = bhxh.SHCC
                           AND (bhxh_temp5.BAT_DAU IS NULL OR fromYear IS NULL OR
                                bhxh_temp5.BAT_DAU >= fromYear)
                           AND (bhxh_temp5.KET_THUC IS NULL OR toYear IS NULL OR
                                bhxh_temp5.KET_THUC <= toYear) ) AS "danhSachBatDauType",
                        
                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        
                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",
                        
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        ROW_NUMBER() OVER (ORDER BY bhxh.KET_THUC DESC ) R
                     FROM (SELECT *
                          FROM QT_BAO_HIEM_XA_HOI
                          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAO_HIEM_XA_HOI ORDER BY SHCC DESC) GROUP BY SHCC)) bhxh
                              LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                              LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                              LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                WHERE (list_shcc IS NULL OR INSTR(list_shcc, bhxh.SHCC) != 0)
                  AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
                  AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                ORDER BY bhxh.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                           searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAO_HIEM_XA_HOI bhxh
             LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
      AND (bhxh.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT bhxh.ID             as  "id",
                        bhxh.BAT_DAU        as  "batDau",
                        bhxh.BAT_DAU_TYPE   as  "batDauType",
                        bhxh.KET_THUC       as  "ketThuc",
                        bhxh.KET_THUC_TYPE  as  "ketThucType",
                        bhxh.CHUC_VU        as  "chucVu",
                        bhxh.MUC_DONG       as  "mucDong",
                        bhxh.PHU_CAP_CHUC_VU    as  "phuCapChucVu",
                        bhxh.PHU_CAP_THAM_NIEN_VUOT_KHUNG   as  "phuCapThamNienVuotKhung",
                        bhxh.PHU_CAP_THAM_NIEN_NGHE     as  "phuCapThamNienNghe",
                        bhxh.TY_LE_DONG     as  "tyLeDong",
                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY bhxh.KET_THUC DESC ) R
                 FROM QT_BAO_HIEM_XA_HOI    bhxh
                          LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                 WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
                   AND (bhxh.SHCC = searchTerm)
                 ORDER BY bhxh.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAO_HIEM_XA_HOI bhxh
             LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (list_shcc IS NULL OR INSTR(list_shcc, bhxh.SHCC) != 0)
      AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
      AND (fromYear IS NULL OR bhxh.BAT_DAU IS NULL OR bhxh.BAT_DAU >= fromYear)
      AND (toYear IS NULL OR bhxh.KET_THUC IS NULL OR bhxh.KET_THUC <= toYear)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        bhxh.ID             as  "id",
                        bhxh.SHCC           as  "shcc",
                        bhxh.BAT_DAU        as  "batDau",
                        bhxh.BAT_DAU_TYPE   as  "batDauType",
                        bhxh.KET_THUC       as  "ketThuc",
                        bhxh.KET_THUC_TYPE  as  "ketThucType",
                        bhxh.CHUC_VU        as  "chucVu",
                        bhxh.MUC_DONG       as  "mucDong",
                        bhxh.PHU_CAP_CHUC_VU    as  "phuCapChucVu",
                        bhxh.PHU_CAP_THAM_NIEN_VUOT_KHUNG   as  "phuCapThamNienVuotKhung",
                        bhxh.PHU_CAP_THAM_NIEN_NGHE     as  "phuCapThamNienNghe",
                        bhxh.TY_LE_DONG     as  "tyLeDong",
                        
                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        
                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",
                        
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY bhxh.KET_THUC DESC ) R
                 FROM QT_BAO_HIEM_XA_HOI bhxh
                          LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                 WHERE (list_shcc IS NULL OR INSTR(list_shcc, bhxh.SHCC) != 0)
                   AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
                   AND (fromYear IS NULL OR bhxh.BAT_DAU IS NULL OR bhxh.BAT_DAU >= fromYear)
                   AND (toYear IS NULL OR bhxh.KET_THUC IS NULL OR bhxh.KET_THUC <= toYear)
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                 ORDER BY bhxh.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT qtcv.SHCC                    AS "shcc",
               qtcv.STT                     AS "stt",
               cb.HO                        AS "ho",
               cb.TEN                       AS "ten",
               cv.PHU_CAP                   AS "phuCap",
               qtcv.MA_DON_VI               AS "maDonVi",
               dv.TEN                       AS "tenDonVi",
               qtcv.MA_BO_MON               AS "maBoMon",
               bm.TEN                       AS "tenBoMon",
               qtcv.MA_CHUC_VU              AS "maChucVu",
               cv.TEN                       AS "tenChucVu",
               qtcv.SO_QD                   AS "soQuyetDinh",
               cv.LOAI_CHUC_VU              AS "loaiChucVu",
               qtcv.NGAY_RA_QD              AS "ngayRaQuyetDinh",
               qtcv.CHUC_VU_CHINH           AS "chucVuChinh",
               qtcv.THOI_CHUC_VU            AS "thoiChucVu",
               qtcv.SO_QD_THOI_CHUC_VU      AS "soQdThoiChucVu",
               qtcv.NGAY_THOI_CHUC_VU       AS "ngayThoiChucVu",
               qtcv.NGAY_RA_QD_THOI_CHUC_VU AS "ngayRaQdThoiChucVu"
        FROM QT_CHUC_VU qtcv
                 LEFT JOIN TCHC_CAN_BO cb ON qtcv.SHCC = cb.SHCC
                 LEFT JOIN DM_CHUC_VU cv ON cv.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI dv ON dv.MA = qtcv.MA_DON_VI
                 LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
        WHERE qtcv.SHCC = isSHCC;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_CHUC_VU
          WHERE STT IN (SELECT MAX(STT) FROM (SELECT * FROM QT_CHUC_VU ORDER BY MA_CHUC_VU DESC) GROUP BY SHCC)) qtcv
             LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
             LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
             LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
             LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
       AND (searchTerm = ''
       OR LOWER(qtcv.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(qtcv.SO_QD) LIKE sT
       OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT);


    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcv.SHCC                    AS       "shcc",
                        qtcv.STT                     AS       "stt",
                        cb.HO                        AS       "ho",
                        cb.TEN                       AS       "ten",
                        cv.PHU_CAP                   AS       "phuCap",
                        qtcv.MA_DON_VI               AS       "maDonVi",
                        dv.TEN                       AS       "tenDonVi",
                        qtcv.MA_BO_MON               AS       "maBoMon",
                        bm.TEN                       AS       "tenBoMon",
                        qtcv.MA_CHUC_VU              AS       "maChucVu",
                        cv.TEN                       AS       "tenChucVu",
                        qtcv.SO_QD                   AS       "soQuyetDinh",
                        qtcv.NGAY_RA_QD              AS       "ngayRaQuyetDinh",
                        qtcv.CHUC_VU_CHINH           AS       "chucVuChinh",
                        qtcv.THOI_CHUC_VU            AS       "thoiChucVu",
                        qtcv.SO_QD_THOI_CHUC_VU      AS       "soQdThoiChucVu",
                        qtcv.NGAY_THOI_CHUC_VU       AS       "ngayThoiChucVu",
                        qtcv.NGAY_RA_QD_THOI_CHUC_VU AS       "ngayRaQdThoiChucVu",

                        (SELECT COUNT(*)
                         FROM QT_CHUC_VU qtcv_temp
                         WHERE qtcv_temp.SHCC = qtcv.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear)
                            AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear)
                            AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear)) OR (timeType = 3
                            AND (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear)
                            AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU <= toYear)))
                        ) AS "soChucVu",

                        (Select listagg(cv.TEN || ' ', '??') within group ( order by null)
                         FROM QT_CHUC_VU qtcv_temp1
                            LEFT JOIN DM_CHUC_VU cv on qtcv_temp1.MA_CHUC_VU = cv.MA
                         WHERE qtcv_temp1.SHCC = qtcv.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtcv_temp1.NGAY_RA_QD IS NULL OR qtcv_temp1.NGAY_RA_QD >= fromYear)
                            AND (toYear IS NULL OR qtcv_temp1.NGAY_RA_QD IS NULL OR qtcv_temp1.NGAY_RA_QD <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtcv_temp1.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp1.NGAY_THOI_CHUC_VU >= fromYear)
                            AND (toYear IS NULL OR qtcv_temp1.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp1.NGAY_THOI_CHUC_VU <= toYear)) OR (timeType = 3
                            AND (fromYear IS NULL OR qtcv_temp1.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp1.NGAY_RA_QD_THOI_CHUC_VU >= fromYear)
                            AND (toYear IS NULL OR qtcv_temp1.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp1.NGAY_RA_QD_THOI_CHUC_VU <= toYear)))
                        ) AS "danhSachChucVu",

                        ROW_NUMBER() OVER (ORDER BY qtcv.NGAY_RA_QD_THOI_CHUC_VU DESC ) R
                 FROM (SELECT *
                       FROM QT_CHUC_VU
                       WHERE STT IN
                             (SELECT MAX(STT) FROM (SELECT * FROM QT_CHUC_VU ORDER BY MA_CHUC_VU ASC) GROUP BY SHCC)) qtcv
                          LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
                          LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
                          LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
                          LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv.SHCC) != 0)
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                       AND (searchTerm = ''
                       OR LOWER(qtcv.SHCC) LIKE sT
                       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                       OR LOWER(qtcv.SO_QD) LIKE sT
                       OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT)
                 ORDER BY qtcv.STT DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                       searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_CHUC_VU qtcv
             LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
             LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
             LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
             LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
    WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = qtcv.MA_CHUC_VU) AND searchTerm = qtcv.SHCC;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcv.SHCC                    AS       "shcc",
                        qtcv.STT                     AS       "stt",
                        cb.HO                        AS       "ho",
                        cb.TEN                       AS       "ten",
                        cv.PHU_CAP                   AS       "phuCap",
                        qtcv.MA_DON_VI               AS       "maDonVi",
                        dv.TEN                       AS       "tenDonVi",
                        qtcv.MA_BO_MON               AS       "maBoMon",
                        bm.TEN                       AS       "tenBoMon",
                        qtcv.MA_CHUC_VU              AS       "maChucVu",
                        cv.TEN                       AS       "tenChucVu",
                        qtcv.SO_QD                   AS       "soQuyetDinh",
                        qtcv.NGAY_RA_QD              AS       "ngayRaQuyetDinh",
                        qtcv.CHUC_VU_CHINH           AS       "chucVuChinh",
                        qtcv.THOI_CHUC_VU            AS       "thoiChucVu",
                        qtcv.SO_QD_THOI_CHUC_VU      AS       "soQdThoiChucVu",
                        qtcv.NGAY_THOI_CHUC_VU       AS       "ngayThoiChucVu",
                        qtcv.NGAY_RA_QD_THOI_CHUC_VU AS       "ngayRaQdThoiChucVu",
                        ROW_NUMBER() OVER (ORDER BY qtcv.MA_CHUC_VU ASC) R
                 FROM QT_CHUC_VU qtcv
                          LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
                          LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
                          LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
                          LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
                 WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = qtcv.MA_CHUC_VU) AND searchTerm = qtcv.SHCC
                 ORDER BY QTCV.MA_CHUC_VU ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_CHUC_VU qtcv
             LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
             LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
             LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
             LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND ((timeType = 0 AND
            (fromYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD <= toYear))
          OR ((timeType = 1) AND
              (fromYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU <= toYear))
          OR ((timeType = 2) AND
              (fromYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD <= toYear))
          )
        AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtcv.SO_QD) LIKE sT
        OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcv.SHCC                    AS       "shcc",
                        qtcv.STT                     AS       "stt",
                        cb.HO                        AS       "ho",
                        cb.TEN                       AS       "ten",
                        cv.PHU_CAP                   AS       "phuCap",
                        qtcv.MA_DON_VI               AS       "maDonVi",
                        dv.TEN                       AS       "tenDonVi",
                        qtcv.MA_BO_MON               AS       "maBoMon",
                        bm.TEN                       AS       "tenBoMon",
                        qtcv.MA_CHUC_VU              AS       "maChucVu",
                        cv.TEN                       AS       "tenChucVu",
                        qtcv.SO_QD                   AS       "soQuyetDinh",
                        qtcv.NGAY_RA_QD              AS       "ngayRaQuyetDinh",
                        qtcv.CHUC_VU_CHINH           AS       "chucVuChinh",
                        qtcv.THOI_CHUC_VU            AS       "thoiChucVu",
                        qtcv.SO_QD_THOI_CHUC_VU      AS       "soQdThoiChucVu",
                        qtcv.NGAY_THOI_CHUC_VU       AS       "ngayThoiChucVu",
                        qtcv.NGAY_RA_QD_THOI_CHUC_VU AS       "ngayRaQdThoiChucVu",
                        ROW_NUMBER() OVER (ORDER BY qtcv.MA_CHUC_VU ASC) R
                 FROM QT_CHUC_VU qtcv
                          LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
                          LEFT JOIN DM_CHUC_VU cv ON qtcv.MA_CHUC_VU = cv.MA
                          LEFT JOIN DM_DON_VI dv ON qtcv.MA_DON_VI = dv.MA
                          LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv.SHCC) != 0)
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND ((timeType = 0 AND
                            (fromYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD <= toYear))
                          OR ((timeType = 1) AND
                              (fromYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU <= toYear))
                          OR ((timeType = 2) AND
                              (fromYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD <= toYear))
                          )
                        AND (searchTerm = ''
                        OR LOWER(cb.SHCC) LIKE sT
                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                        OR LOWER(qtcv.SO_QD) LIKE sT
                        OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT)
                 ORDER BY QTCV.MA_CHUC_VU ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.GHI_CHU_HINH_THUC     AS "ghiChuHinhThuc",
               DT.GHI_CHU_LOAI_BANG_CAP AS "ghiChuLoaiBangCap",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
        FROM QT_DAO_TAO DT
                 LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
        WHERE DT.SHCC = isSHCC;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_CC_CAN_BO(iSHCC in string) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.GHI_CHU_HINH_THUC     AS "ghiChuHinhThuc",
               DT.GHI_CHU_LOAI_BANG_CAP AS "ghiChuLoaiBangCap",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM QT_DAO_TAO DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC AND (DT.LOAI_BANG_CAP = '5' OR DT.LOAI_BANG_CAP = '6' OR DT.LOAI_BANG_CAP = '7' OR DT.LOAI_BANG_CAP = '8');
    RETURN my_cursor;
end;
/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_HOC_VI_CAN_BO(iSHCC in string) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.GHI_CHU_HINH_THUC     AS "ghiChuHinhThuc",
               DT.GHI_CHU_LOAI_BANG_CAP AS "ghiChuLoaiBangCap",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM QT_DAO_TAO DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC AND (DT.TRINH_DO = '1' OR DT.TRINH_DO = '2' OR DT.TRINH_DO = '3' OR DT.TRINH_DO = '4');
    RETURN my_cursor;
end;
/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_TRINH_DO_CHINH_TRI_CAN_BO(iSHCC in string) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.GHI_CHU_HINH_THUC     AS "ghiChuHinhThuc",
               DT.GHI_CHU_LOAI_BANG_CAP AS "ghiChuLoaiBangCap",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM (SELECT *
                FROM QT_DAO_TAO
                WHERE TRINH_DO IN (SELECT MIN(TRINH_DO) FROM (SELECT * FROM QT_DAO_TAO DT1 WHERE DT1.LOAI_BANG_CAP = '7' AND DT1.SHCC = iSHCC)
                    )) DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC;
    RETURN my_cursor;
end;
/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_TRINH_DO_QLNN_CAN_BO(iSHCC in string) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.GHI_CHU_HINH_THUC     AS "ghiChuHinhThuc",
               DT.GHI_CHU_LOAI_BANG_CAP AS "ghiChuLoaiBangCap",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM (SELECT *
                FROM QT_DAO_TAO
                WHERE TRINH_DO IN (SELECT MAX(TRINH_DO) FROM (SELECT * FROM QT_DAO_TAO DT1 WHERE DT1.LOAI_BANG_CAP = '8' AND DT1.SHCC = iSHCC)
                    )) DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC;
    RETURN my_cursor;
end;
/
--EndMethod--

CREATE OR REPLACE function QT_DAO_TAO_GET_TRINH_DO_TIN_HOC_CAN_BO(iSHCC in string) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;

begin
    open my_cursor FOR
        select DT.ID                    AS "id",
               DT.SHCC                  AS "shcc",
               CB.HO                    AS "ho",
               CB.TEN                   AS "ten",
               DT.TEN_TRUONG            AS "tenCoSoDaoTao",
               DT.CHUYEN_NGANH          AS "chuyenNganh",
               DT.BAT_DAU               AS "batDau",
               DT.BAT_DAU_TYPE          AS "batDauType",
               DT.KET_THUC              AS "ketThuc",
               DT.KET_THUC_TYPE         AS "ketThucType",
               DT.THOI_GIAN             AS "thoiGian",
               DT.GHI_CHU_HINH_THUC     AS "ghiChuHinhThuc",
               DT.GHI_CHU_LOAI_BANG_CAP AS "ghiChuLoaiBangCap",
               DT.TRINH_DO              AS "trinhDo",

               LBC.TEN                  AS "tenLoaiBangCap",
               TDDT.TEN                 AS "tenTrinhDo",
               HTDT.TEN                 AS "tenHinhThuc",
               DT.LOAI_BANG_CAP         AS "loaiBangCap",
               DT.HINH_THUC             AS "hinhThuc"
            FROM (SELECT *
                FROM QT_DAO_TAO
                WHERE TRINH_DO IN (SELECT MAX(TRINH_DO) FROM (SELECT * FROM QT_DAO_TAO DT1 WHERE DT1.LOAI_BANG_CAP = '6' AND DT1.SHCC = iSHCC ORDER BY DT1.BAT_DAU DESC )
                    )) DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC;
    RETURN my_cursor;
end;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
            FROM QT_DAO_TAO
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC ) GROUP BY SHCC)) qtdt
             LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (list_shcc IS NULL OR INSTR(list_shcc, qtdt.SHCC) != 0)
      AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        qtdt.ID             as  "id",
                        qtdt.SHCC           as  "shcc",
                        qtdt.TEN_TRUONG     as  "tenTruong",
                        qtdt.CHUYEN_NGANH   as  "chuyenNganh",
                        qtdt.BAT_DAU        as  "batDau",
                        qtdt.BAT_DAU_TYPE   as  "batDauType",
                        qtdt.KET_THUC       as  "ketThuc",
                        qtdt.KET_THUC_TYPE  as  "ketThucType",
                        qtdt.HINH_THUC      as  "hinhThuc",
                        qtdt.LOAI_BANG_CAP  as  "loaiBangCap",
                        qtdt.GHI_CHU_HINH_THUC  as  "ghiChuHinhThuc",
                        qtdt.GHI_CHU_LOAI_BANG_CAP  as  "ghiChuLoaiBangCap",
                        qtdt.TRINH_DO       as  "trinhDo",
                        qtdt.KINH_PHI       as  "kinhPhi",
                        
                        (SELECT COUNT(*)
                         FROM QT_DAO_TAO qtdt_temp
                         WHERE qtdt_temp.SHCC = qtdt.SHCC
                           AND (qtdt_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                                qtdt_temp.BAT_DAU >= fromYear)
                           AND (qtdt_temp.KET_THUC IS NULL OR toYear IS NULL OR
                                qtdt_temp.KET_THUC <= toYear)
                        ) AS "soQuaTrinh",

                        (Select listagg(qtdt_temp2.CHUYEN_NGANH, '??') within group ( order by null)
                         from QT_DAO_TAO qtdt_temp2
                         where qtdt_temp2.SHCC = qtdt.SHCC) AS "danhSachChuyenNganh",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        bdt.TEN             as  "tenBDT",
                        htdt.TEN            as  "tenHTDT",

                        ROW_NUMBER() OVER (ORDER BY qtdt.BAT_DAU ASC) R
                FROM (SELECT *
                        FROM QT_DAO_TAO
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC ) GROUP BY SHCC)) qtdt
                         LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                         LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                WHERE (list_shcc IS NULL OR INSTR(list_shcc, qtdt.SHCC) != 0)
                  AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                ORDER BY qtdt.BAT_DAU ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       list_shcc IN STRING, list_dv IN STRING,
                                       fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DAO_TAO qtdt
             LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (list_shcc IS NULL OR INSTR(list_shcc, qtdt.SHCC) != 0)
      AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
      AND (fromYear IS NULL OR qtdt.BAT_DAU IS NULL OR qtdt.BAT_DAU >= fromYear)
      AND (toYear IS NULL OR qtdt.KET_THUC IS NULL OR qtdt.KET_THUC <= toYear)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdt.ID                    as                   "id",
                        qtdt.SHCC                  as                   "shcc",
                        qtdt.TEN_TRUONG            as                   "tenCoSoDaoTao",
                        qtdt.CHUYEN_NGANH          as                   "chuyenNganh",
                        qtdt.BAT_DAU               as                   "batDau",
                        qtdt.BAT_DAU_TYPE          as                   "batDauType",
                        qtdt.KET_THUC              as                   "ketThuc",
                        qtdt.KET_THUC_TYPE         as                   "ketThucType",
                        qtdt.HINH_THUC             as                   "hinhThuc",
                        qtdt.LOAI_BANG_CAP         as                   "loaiBangCap",
                        qtdt.GHI_CHU_HINH_THUC     as                   "ghiChuHinhThuc",
                        qtdt.GHI_CHU_LOAI_BANG_CAP as                   "ghiChuLoaiBangCap",
                        qtdt.TRINH_DO              as                   "trinhDo",
                        qtdt.KINH_PHI              as                   "kinhPhi",

                        cb.TEN                     as                   "tenCanBo",
                        cb.HO                      as                   "hoCanBo",
                        dv.MA                      AS                   "maDonVi",
                        dv.TEN                     AS                   "tenDonVi",
                        bdt.TEN                    as                   "tenLoaiBangCap",
                        htdt.TEN                   as                   "tenHinhThuc",
                        TDDT.TEN                   AS                   "tenTrinhDo",
                        ROW_NUMBER() OVER (ORDER BY qtdt.KET_THUC DESC) R
                 FROM QT_DAO_TAO qtdt
                          LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                          LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                          LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
                 WHERE (list_shcc IS NULL OR INSTR(list_shcc, qtdt.SHCC) != 0)
                   AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
                   AND (fromYear IS NULL OR qtdt.BAT_DAU IS NULL OR qtdt.BAT_DAU >= fromYear)
                   AND (toYear IS NULL OR qtdt.KET_THUC IS NULL OR qtdt.KET_THUC <= toYear)
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE ST
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                 ORDER BY qtdt.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_GIAI_THUONG
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC ) GROUP BY SHCC)) qtgt           
            LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtgt.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtgt.ID           AS                "id",
                        qtgt.TEN_GIAI_THUONG    AS "tenGiaiThuong",
                        qtgt.NOI_DUNG   AS "noiDung",
                        qtgt.NOI_CAP    AS "noiCap",
                        qtgt.NAM_CAP    AS "namCap",
                        qtgt.SHCC AS "shcc",

                        (SELECT COUNT(*)
                         FROM QT_GIAI_THUONG qtgt_temp
                         WHERE qtgt_temp.SHCC = qtgt.SHCC
                           AND (qtgt_temp.NAM_CAP IS NULL OR fromYear IS NULL OR
                                qtgt_temp.NAM_CAP >= fromYear)
                           AND (qtgt_temp.NAM_CAP IS NULL OR toYear IS NULL OR
                                qtgt_temp.NAM_CAP <= toYear)
                        ) AS "soGiaiThuong",

                        (Select listagg(qtgt_temp2.TEN_GIAI_THUONG, '??') within group ( order by null)
                         from QT_GIAI_THUONG qtgt_temp2
                        WHERE qtgt_temp2.SHCC = qtgt.SHCC
                           AND (qtgt_temp2.NAM_CAP IS NULL OR fromYear IS NULL OR
                                qtgt_temp2.NAM_CAP >= fromYear)
                           AND (qtgt_temp2.NAM_CAP IS NULL OR toYear IS NULL OR
                                qtgt_temp2.NAM_CAP <= toYear)
                        ) AS "danhSachGiaiThuong",
                        
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
                FROM (SELECT *
                        FROM QT_GIAI_THUONG
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC ) GROUP BY SHCC)) qtgt     
                         LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtgt.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                ORDER BY qtgt.NAM_CAP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_GIAI_THUONG qtgt
             LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtgt.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtgt.ID           AS                "id",
                        qtgt.TEN_GIAI_THUONG    AS "tenGiaiThuong",
                        qtgt.NOI_DUNG   AS "noiDung",
                        qtgt.NOI_CAP    AS "noiCap",
                        qtgt.NAM_CAP    AS "namCap",
                        qtgt.SHCC AS "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM QT_GIAI_THUONG qtgt
                         LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtgt.SHCC = searchTerm)
                ORDER BY qtgt.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_GIAI_THUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_GIAI_THUONG qtgt
             LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtgt.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR qtgt.NAM_CAP IS NULL OR TO_NUMBER(qtgt.NAM_CAP) >= fromYear)
      AND (toYear IS NULL OR qtgt.NAM_CAP IS NULL OR TO_NUMBER(qtgt.NAM_CAP) <= toYear)
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtgt.ID           AS                "id",
                        qtgt.TEN_GIAI_THUONG    AS "tenGiaiThuong",
                        qtgt.NOI_DUNG   AS "noiDung",
                        qtgt.NOI_CAP    AS "noiCap",
                        qtgt.NAM_CAP    AS "namCap",
                        qtgt.SHCC AS "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
                FROM QT_GIAI_THUONG qtgt
                         LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtgt.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR qtgt.NAM_CAP IS NULL OR TO_NUMBER(qtgt.NAM_CAP) >= fromYear)
                  AND (toYear IS NULL OR qtgt.NAM_CAP IS NULL OR TO_NUMBER(qtgt.NAM_CAP) <= toYear)
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                ORDER BY qtgt.NAM_CAP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT htct.ID            as "id",
               htct.SHCC          as "shcc",
               htct.BAT_DAU       as "batDau",
               htct.KET_THUC      as "ketThuc",
               htct.NOI_DUNG      as "noiDung",
               htct.BAT_DAU_TYPE  as "batDauType",
               htct.KET_THUC_TYPE as "ketThucType",
               cb.TEN             as "tenCanBo",
               cb.HO              as "hoCanBo"
        FROM QT_HOC_TAP_CONG_TAC htct
                 LEFT JOIN TCHC_CAN_BO CB ON htct.SHCC = CB.SHCC
        WHERE htct.SHCC = isSHCC;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
            FROM QT_HOC_TAP_CONG_TAC
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
     WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, htct.SHCC) != 0)
       OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI)  != 0)
       OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        htct.ID            as   "id",
                        htct.SHCC          as   "shcc",
                        htct.BAT_DAU       as   "batDau",
                        htct.KET_THUC      as   "ketThuc",
                        htct.NOI_DUNG      as   "noiDung",
                        htct.BAT_DAU_TYPE  as   "batDauType",
                        htct.KET_THUC_TYPE as   "ketThucType",

                        (SELECT COUNT(*)
                         FROM QT_HOC_TAP_CONG_TAC htct_temp
                         WHERE htct_temp.SHCC = htct.SHCC
                           AND (htct_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                                htct_temp.BAT_DAU >= fromYear)
                           AND (htct_temp.KET_THUC IS NULL OR toYear IS NULL OR
                                htct_temp.KET_THUC <= toYear)
                        ) AS "soNoiDung",
                        
                        (Select listagg(htct_temp2.NOI_DUNG, '??') within group ( order by null)
                         from QT_HOC_TAP_CONG_TAC htct_temp2
                        WHERE htct_temp2.SHCC = htct.SHCC
                           AND (htct_temp2.BAT_DAU IS NULL OR fromYear IS NULL OR
                                htct_temp2.BAT_DAU >= fromYear)
                           AND (htct_temp2.KET_THUC IS NULL OR toYear IS NULL OR
                                htct_temp2.KET_THUC <= toYear)
                        ) AS "danhSachNoiDung",
                        
                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY htct.BAT_DAU ASC) R
                FROM (SELECT *
                        FROM QT_HOC_TAP_CONG_TAC
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) htct
                         LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, htct.SHCC) != 0)
                   OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI)  != 0)
                   OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                ORDER BY htct.BAT_DAU ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                           searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOC_TAP_CONG_TAC htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
      AND (htct.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT htct.ID            as   "id",
                        cb.TEN             as   "ten",
                        cb.HO              as   "ho",
                        htct.SHCC          as   "shcc",
                        htct.BAT_DAU       as   "batDau",
                        htct.KET_THUC      as   "ketThuc",
                        htct.NOI_DUNG      as   "noiDung",
                        htct.BAT_DAU_TYPE  as   "batDauType",
                        htct.KET_THUC_TYPE as   "ketThucType",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY htct.KET_THUC DESC ) R
                 FROM QT_HOC_TAP_CONG_TAC htct
                          LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
                   AND (htct.SHCC = searchTerm)
                 ORDER BY htct.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOC_TAP_CONG_TAC htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, htct.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR htct.BAT_DAU IS NULL OR htct.BAT_DAU >= fromYear)
      AND (toYear IS NULL OR htct.KET_THUC IS NULL OR htct.KET_THUC <= toYear)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        htct.ID            as   "id",
                        htct.SHCC          as   "shcc",
                        htct.BAT_DAU       as   "batDau",
                        htct.KET_THUC      as   "ketThuc",
                        htct.NOI_DUNG      as   "noiDung",
                        htct.BAT_DAU_TYPE  as   "batDauType",
                        htct.KET_THUC_TYPE as   "ketThucType",
                        
                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY htct.KET_THUC DESC) R
                 FROM QT_HOC_TAP_CONG_TAC htct
                          LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, htct.SHCC) != 0)
                   OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI)  != 0)
                   OR (list_shcc IS NULL AND list_dv IS NULL))
                   AND (fromYear IS NULL OR htct.BAT_DAU IS NULL OR htct.BAT_DAU >= fromYear)
                   AND (toYear IS NULL OR htct.KET_THUC IS NULL OR htct.KET_THUC <= toYear)
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE ST
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                 ORDER BY htct.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DVTL_TN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_DVTL_TN hd
                LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
                LEFT JOIN DM_DIEN_HOP_DONG dhd ON hd.KIEU_HOP_DONG = dhd.MA
                LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN cbdvtl ON hd.NGUOI_DUOC_THUE = cbdvtl.SHCC
                LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HOP_DONG = lhd.MA
                LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                LEFT JOIN DM_DON_VI dvct on hd.DON_VI_CHI_TRA = dvct.MA
            LEFT JOIN DM_CHUC_VU DCV on hd.CHUC_DANH_CHUYEN_MON = DCV.MA
    WHERE searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT
        or lower(hd.KIEU_HOP_DONG) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE                           AS  "shcc",
                        hd.MA AS "ma",
                        cbdvtl.HO                               AS  "ho",
                        cbdvtl.TEN                              AS  "ten",
                        hd.NGUOI_KY                        as "nguoiKy",
                        cbk.SHCC                            as "shccNguoiKy",
                        cbk.HO                                as "hoNguoiKy",
                        cbk.TEN                             as "tenNguoiKy",
                        cbk.CHUC_VU_KIEM_NHIEM               as "chucVuNguoiKy",
                        hd.SO_HOP_DONG as "soHopDong",
                        dhd.TEN as "dienHopDong",
                        hd.KIEU_HOP_DONG as "kieuHopDong",
                        hd.LOAI_HOP_DONG as "loaiHopDong",
                        lhd.TEN as "tenLoaiHopDong",
                        hd.BAT_DAU_LAM_VIEC as "batDauLamViec",
                        hd.KET_THUC_HOP_DONG as "ketThucHopDong",
                        hd.NGAY_KY_HD_TIEP_THEO as "ngayKyHopDongTiepTheo",
                        hd.DIA_DIEM_LAM_VIEC as "diaDiemLamViec",
                        dv.TEN as "tenDiaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON as "chucDanhChuyenMon",
                        DCV.TEN as "tenChucDanhChuyenMon",
                        hd.CONG_VIEC_DUOC_GIAO as "congViecDuocGiao",
                        hd.CHIU_SU_PHAN_CONG as "chiuSuPhanCong",
                        hd.DON_VI_CHI_TRA as "donViChiTra",
                        dvct.TEN as "tenDonViChiTra",
                        hd.NGACH as "ngach",
                        hd.BAC as "bac",
                        hd.HE_SO as "heSo",
                        hd.HIEU_LUC_HOP_DONG as "hieuLucHopDong",
                        hd.NGAY_KY_HOP_DONG as "ngayKyHopDong",
                        hd.PHAN_TRAM_HUONG as "phanTramHuong",
                        hd.TIEN_LUONG as "tienLuong",
                         ROW_NUMBER() OVER (ORDER BY hd.MA DESC) R
                FROM QT_HOP_DONG_DVTL_TN hd
                LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
                LEFT JOIN DM_DIEN_HOP_DONG dhd ON hd.KIEU_HOP_DONG = dhd.MA
                LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN cbdvtl ON hd.NGUOI_DUOC_THUE = cbdvtl.SHCC
                                 LEFT JOIN DM_DON_VI dvct on hd.DON_VI_CHI_TRA = dvct.MA
LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HOP_DONG = lhd.MA
                                LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                                LEFT JOIN DM_CHUC_VU DCV on hd.CHUC_DANH_CHUYEN_MON = DCV.MA
                 WHERE searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT
        or lower(hd.KIEU_HOP_DONG) LIKE sT
                    ORDER BY hd.NGAY_KY_HOP_DONG DESC, hd.SO_HOP_DONG DESC
            )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_LAO_DONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                maDonVi IN STRING, searchTerm IN STRING,
                                                totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_HOP_DONG_LAO_DONG
          WHERE MA IN
                (SELECT MAX(MA) FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG ORDER BY MA DESC) GROUP BY NGUOI_DUOC_THUE)) hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
    WHERE (maDonVi = '-1' OR INSTR(maDonVi, benA.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR hd.NGUOI_DUOC_THUE = searchTerm
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE      AS              "shcc",
                        hd.MA                   AS              "ma",
                        benA.HO                 AS              "hoBenA",
                        benA.TEN                AS              "tenBenA",
                        nguoiKy.SHCC            as              "shccNguoiKy",
                        nguoiKy.HO              as              "hoNguoiKy",
                        nguoiKy.TEN             as              "tenNguoiKy",
                        nguoiKy.MA_CHUC_VU      as              "chucVuNguoiKy",
                        hd.SO_HOP_DONG          as              "soHopDong",

                        hd.LOAI_HOP_DONG        as              "loaiHopDong",
                        lhd.TEN                 as              "tenLoaiHopDong",
                        hd.BAT_DAU_LAM_VIEC     as              "batDauLamViec",
                        hd.KET_THUC_HOP_DONG    as              "ketThucHopDong",
                        hd.NGAY_KY_HD_TIEP_THEO as              "ngayKyHopDongTiepTheo",
                        hd.DIA_DIEM_LAM_VIEC    as              "diaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON as              "chucDanhChuyenMon",
                        hd.CONG_VIEC_DUOC_GIAO  as              "congViecDuocGiao",
                        hd.CHIU_SU_PHAN_CONG    as              "chiuSuPhanCong",
                        hd.MA_NGACH             as              "maNgach",
                        hd.BAC                  as              "bac",
                        hd.HE_SO                as              "heSo",
                        hd.NGAY_KY_HOP_DONG     as              "ngayKyHopDong",
                        hd.PHAN_TRAM_HUONG      as              "phanTramHuong",
                        ROW_NUMBER() OVER (ORDER BY hd.MA DESC) R
                 FROM (SELECT *
                       FROM QT_HOP_DONG_LAO_DONG
                       WHERE MA IN (SELECT MAX(MA)
                                    FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG ORDER BY MA DESC)
                                    GROUP BY NGUOI_DUOC_THUE)) hd
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                          LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HOP_DONG = lhd.MA
                 WHERE (maDonVi = '-1' OR INSTR(maDonVi, benA.MA_DON_VI) != 0)
                   AND (searchTerm = ''
                     OR hd.NGUOI_DUOC_THUE = searchTerm
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                     OR LOWER(hd.SO_HOP_DONG) LIKE sT)
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_LAO_DONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 maDonVi IN STRING, searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_LAO_DONG hd
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
             LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
    WHERE (maDonVi = '-1' OR INSTR(maDonVi, benA.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT
        OR LOWER(ncdnn.TEN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE      AS              "shcc",
                        hd.MA                   AS              "ma",
                        benA.HO                 AS              "hoBenA",
                        benA.TEN                AS              "tenBenA",
                        nguoiKy.SHCC            as              "shccNguoiKy",
                        nguoiKy.HO              as              "hoNguoiKy",
                        nguoiKy.TEN             as              "tenNguoiKy",
                        nguoiKy.MA_CHUC_VU      as              "chucVuNguoiKy",
                        nguoiKy.MA_DON_VI       as              "donviNguoiKy",
                        hd.SO_HOP_DONG          as              "soHopDong",

                        hd.LOAI_HOP_DONG        as              "loaiHopDong",
                        lhd.TEN                 as              "tenLoaiHopDong",
                        hd.BAT_DAU_LAM_VIEC     as              "batDauLamViec",
                        hd.KET_THUC_HOP_DONG    as              "ketThucHopDong",
                        hd.NGAY_KY_HD_TIEP_THEO as              "ngayKyHopDongTiepTheo",
                        hd.DIA_DIEM_LAM_VIEC    as              "diaDiemLamViec",
                        dv.TEN                  as              "tenDiaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON as              "chucDanhChuyenMon",
                        cdcm.TEN                as              "tenChucDanhChuyenMon",
                        hd.CONG_VIEC_DUOC_GIAO  as              "congViecDuocGiao",
                        hd.CHIU_SU_PHAN_CONG    as              "chiuSuPhanCong",
                        hd.MA_NGACH             as              "maNgach",
                        hd.BAC                  as              "bac",
                        hd.HE_SO                as              "heSo",
                        hd.NGAY_KY_HOP_DONG     as              "ngayKyHopDong",
                        hd.PHAN_TRAM_HUONG      as              "phanTramHuong",
                        ROW_NUMBER() OVER (ORDER BY hd.MA DESC) R
                 FROM QT_HOP_DONG_LAO_DONG hd
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                          LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HOP_DONG = lhd.MA
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE (maDonVi = '-1' OR INSTR(maDonVi, benA.MA_DON_VI) != 0)
                   AND (searchTerm = ''
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                     OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                     OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                     OR LOWER(hd.SO_HOP_DONG) LIKE sT
                     OR LOWER(ncdnn.TEN) LIKE sT)
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_LAO_DONG_SHCC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM QT_HOP_DONG_LAO_DONG hd
    WHERE
       hd.NGUOI_DUOC_THUE = searchTerm;

    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                  SELECT hd.NGUOI_DUOC_THUE      AS              "shcc",
                        hd.MA                   AS              "ma",
                        benA.HO                 AS              "hoBenA",
                        benA.TEN                AS              "tenBenA",
                        nguoiKy.SHCC            as              "shccNguoiKy",
                        nguoiKy.HO              as              "hoNguoiKy",
                        nguoiKy.TEN             as              "tenNguoiKy",
                        nguoiKy.MA_CHUC_VU      as              "chucVuNguoiKy",
                        hd.SO_HOP_DONG          as              "soHopDong",

                        hd.LOAI_HOP_DONG        as              "loaiHopDong",
                        lhd.TEN                 as              "tenLoaiHopDong",
                        hd.BAT_DAU_LAM_VIEC     as              "batDauLamViec",
                        hd.KET_THUC_HOP_DONG    as              "ketThucHopDong",
                        hd.NGAY_KY_HD_TIEP_THEO as              "ngayKyHopDongTiepTheo",
                        hd.DIA_DIEM_LAM_VIEC    as              "diaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON as              "chucDanhChuyenMon",
                        hd.CONG_VIEC_DUOC_GIAO  as              "congViecDuocGiao",
                        hd.CHIU_SU_PHAN_CONG    as              "chiuSuPhanCong",
                        hd.MA_NGACH             as              "maNgach",
                        hd.BAC                  as              "bac",
                        hd.HE_SO                as              "heSo",
                        hd.NGAY_KY_HOP_DONG     as              "ngayKyHopDong",
                        hd.PHAN_TRAM_HUONG      as              "phanTramHuong",
                        ROW_NUMBER() OVER (ORDER BY hd.MA DESC) R
                 FROM QT_HOP_DONG_LAO_DONG hd
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                          LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HOP_DONG = lhd.MA
                WHERE
       hd.NGUOI_DUOC_THUE = searchTerm
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_VIEN_CHUC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 maDonVi IN STRING, searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_HOP_DONG_VIEN_CHUC
          WHERE MA IN
                (SELECT MAX(MA)
                 FROM (SELECT * FROM QT_HOP_DONG_VIEN_CHUC ORDER BY MA DESC)
                 GROUP BY NGUOI_DUOC_THUE)) hd
             LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
             LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
    WHERE (maDonVi = '-1' OR INSTR(maDonVi, benB.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
        OR LOWER(hd.SO_QD) LIKE sT
        OR LOWER(ncdnn.TEN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE              AS                      "shcc",
                        hd.MA                           AS                      "ma",
                        benB.HO                         AS                      "hoBenB",
                        benB.TEN                        AS                      "tenBenB",
                        benA.SHCC                       as                      "shccNguoiKy",
                        benA.HO                         as                      "hoNguoiKy",
                        benA.TEN                        as                      "tenNguoiKy",
                        benA.MA_CHUC_VU                 as                      "chucVuNguoiKy",
                        benA.MA_DON_VI                  as                      "donviNguoiKy",
                        hd.SO_QD                        as                      "soQuyetDinh",
                        hd.NOI_DUNG                     as                      "noiDung",
                        hd.LOAI_HD                      as                      "loaiHopDong",
                        lhd.TEN                         as                      "tenLoaiHopDong",
                        hd.NGAY_KY_HOP_DONG             as                      "ngayKyHopDong",
                        hd.NGAY_KET_THUC_HOP_DONG       as                      "ketThucHopDong",
                        hd.NGAY_KY_QUYET_DINH           as                      "ngayKyQuyetDinh",
                        hd.NGAY_KY_HD_TIEP_THEO         as                      "ngayKyHopDongTiepTheo",
                        hd.HIEU_LUC_HOP_DONG            as                      "hieuLucHopDong",
                        hd.NGAY_BAT_DAU_LAM_VIEC        as                      "batDauLamViec",
                        hd.DIA_DIEM_LAM_VIEC            as                      "diaDiemLamViec",
                        dv.TEN                          as                      "tenDiaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON         as                      "chucDanhChuyenMon",
                        cdcm.TEN                        as                      "tenChucDanhChuyenMon",
                        hd.NHIEM_VU                     as                      "congViecDuocGiao",
                        hd.MA_NGACH                     as                      "maNgach",
                        hd.BAC                          as                      "bac",
                        hd.HE_SO                        as                      "heSo",
                        hd.THOI_GIAN_XET_NANG_BAC_LUONG as                      "thoiGianXetNangBacLuong",
                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_QUYET_DINH DESC) R
                 FROM (SELECT *
                       FROM QT_HOP_DONG_VIEN_CHUC
                       WHERE MA IN
                             (SELECT MAX(MA)
                              FROM (SELECT * FROM QT_HOP_DONG_VIEN_CHUC ORDER BY MA DESC)
                              GROUP BY NGUOI_DUOC_THUE)) hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
                          LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE (maDonVi = '-1' OR INSTR(maDonVi, benB.MA_DON_VI) != 0)
                   AND (searchTerm = ''
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                     OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                     OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                     OR LOWER(hd.SO_QD) LIKE sT
                     OR LOWER(ncdnn.TEN) LIKE sT)
                 ORDER BY hd.NGAY_KY_QUYET_DINH DESC, benB.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_VIEN_CHUC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  maDonVi IN STRING, searchTerm IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_VIEN_CHUC hd
             LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
             LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
             LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
             LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
             LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
             LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
    WHERE (maDonVi = '-1' OR INSTR(maDonVi, benB.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
        OR LOWER(hd.SO_QD) LIKE sT
        OR LOWER(ncdnn.TEN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE              AS                      "shcc",
                        hd.MA                           AS                      "ma",
                        benB.HO                         AS                      "hoBenB",
                        benB.TEN                        AS                      "tenBenB",
                        benA.SHCC                       as                      "shccNguoiKy",
                        benA.HO                         as                      "hoNguoiKy",
                        benA.TEN                        as                      "tenNguoiKy",
                        benA.MA_CHUC_VU                 as                      "chucVuNguoiKy",
                        benA.MA_DON_VI                  as                      "donviNguoiKy",
                        hd.SO_QD                        as                      "soQuyetDinh",
                        hd.NOI_DUNG                     as                      "noiDung",
                        hd.LOAI_HD                      as                      "loaiHopDong",
                        lhd.TEN                         as                      "tenLoaiHopDong",
                        hd.NGAY_KY_HOP_DONG             as                      "ngayKyHopDong",
                        hd.NGAY_KET_THUC_HOP_DONG       as                      "ketThucHopDong",
                        hd.NGAY_KY_QUYET_DINH           as                      "ngayKyQuyetDinh",
                        hd.NGAY_KY_HD_TIEP_THEO         as                      "ngayKyHopDongTiepTheo",
                        hd.HIEU_LUC_HOP_DONG            as                      "hieuLucHopDong",
                        hd.NGAY_BAT_DAU_LAM_VIEC        as                      "batDauLamViec",
                        hd.DIA_DIEM_LAM_VIEC            as                      "diaDiemLamViec",
                        dv.TEN                          as                      "tenDiaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON         as                      "chucDanhChuyenMon",
                        cdcm.TEN                        as                      "tenChucDanhChuyenMon",
                        hd.NHIEM_VU                     as                      "congViecDuocGiao",
                        hd.MA_NGACH                     as                      "maNgach",
                        hd.BAC                          as                      "bac",
                        hd.HE_SO                        as                      "heSo",
                        hd.THOI_GIAN_XET_NANG_BAC_LUONG as                      "thoiGianXetNangBacLuong",
                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_QUYET_DINH DESC) R
                 FROM QT_HOP_DONG_VIEN_CHUC hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
                          LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE (maDonVi = '-1' OR INSTR(maDonVi, benB.MA_DON_VI) != 0)
                   AND (searchTerm = ''
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                     OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                     OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                     OR LOWER(hd.SO_QD) LIKE sT
                     OR LOWER(ncdnn.TEN) LIKE sT)
                 ORDER BY hd.NGAY_KY_QUYET_DINH DESC, benB.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_VIEN_CHUC_SHCC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                      searchTerm IN STRING,
                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_VIEN_CHUC hd
    WHERE
       hd.NGUOI_DUOC_THUE = searchTerm;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE              AS                      "shcc",
                        hd.MA                           AS                      "ma",
                        benB.HO                         AS                      "hoBenB",
                        benB.TEN                        AS                      "tenBenB",
                        benA.SHCC                       as                      "shccNguoiKy",
                        benA.HO                         as                      "hoNguoiKy",
                        benA.TEN                        as                      "tenNguoiKy",
                        benA.MA_CHUC_VU                 as                      "chucVuNguoiKy",
                        benA.MA_DON_VI                  as                      "donviNguoiKy",
                        hd.SO_QD                        as                      "soQuyetDinh",
                        hd.NOI_DUNG                     as                      "noiDung",
                        hd.LOAI_HD                      as                      "loaiHopDong",
                        lhd.TEN                         as                      "tenLoaiHopDong",
                        hd.NGAY_KY_HOP_DONG             as                      "ngayKyHopDong",
                        hd.NGAY_KET_THUC_HOP_DONG       as                      "ketThucHopDong",
                        hd.NGAY_KY_QUYET_DINH           as                      "ngayKyQuyetDinh",
                        hd.NGAY_KY_HD_TIEP_THEO         as                      "ngayKyHopDongTiepTheo",
                        hd.HIEU_LUC_HOP_DONG            as                      "hieuLucHopDong",
                        hd.NGAY_BAT_DAU_LAM_VIEC        as                      "batDauLamViec",
                        hd.DIA_DIEM_LAM_VIEC            as                      "diaDiemLamViec",
                        dv.TEN                          as                      "tenDiaDiemLamViec",
                        hd.CHUC_DANH_CHUYEN_MON         as                      "chucDanhChuyenMon",
                        cdcm.TEN                        as                      "tenChucDanhChuyenMon",
                        hd.NHIEM_VU                     as                      "congViecDuocGiao",
                        hd.MA_NGACH                     as                      "maNgach",
                        hd.BAC                          as                      "bac",
                        hd.HE_SO                        as                      "heSo",
                        hd.THOI_GIAN_XET_NANG_BAC_LUONG as                      "thoiGianXetNangBacLuong",
                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_QUYET_DINH DESC) R
                 FROM QT_HOP_DONG_VIEN_CHUC hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
                          LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE hd.NGUOI_DUOC_THUE = searchTerm
                 ORDER BY hd.NGAY_KY_QUYET_DINH DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HUONG_DAN_LUAN_VAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_HUONG_DAN_LUAN_VAN
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_HUONG_DAN_LUAN_VAN ORDER BY SHCC DESC ) GROUP BY SHCC)) hdlv
            LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, hdlv.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
        OR LOWER(hdlv.SAN_PHAM) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdlv.ID             AS               "id",
                        hdlv.TEN_LUAN_VAN   AS               "tenLuanVan",
                        hdlv.HO_TEN         AS               "hoTen",
                        hdlv.SHCC           as               "shcc",
                        hdlv.NAM_TOT_NGHIEP AS               "namTotNghiep",
                        hdlv.BAC_DAO_TAO    AS               "bacDaoTao",
                        hdlv.SAN_PHAM       AS               "sanPham",
                        cb.HO               AS               "hoCanBo",
                        cb.TEN              AS               "tenCanBo",
                        (SELECT COUNT(*)
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                           AND (hdlv_temp.NAM_TOT_NGHIEP IS NULL OR fromYear IS NULL OR
                                hdlv_temp.NAM_TOT_NGHIEP >= fromYear)
                           AND (hdlv_temp.NAM_TOT_NGHIEP IS NULL OR toYear IS NULL OR
                                hdlv_temp.NAM_TOT_NGHIEP <= toYear)
                        ) AS "soDeTai",

                        (Select listagg(hdlv_temp2.HO_TEN || ' ', '??') within group ( order by null)
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp2
                         WHERE hdlv_temp2.SHCC = hdlv.SHCC
                           AND (hdlv_temp2.NAM_TOT_NGHIEP IS NULL OR fromYear IS NULL OR
                                hdlv_temp2.NAM_TOT_NGHIEP >= fromYear)
                           AND (hdlv_temp2.NAM_TOT_NGHIEP IS NULL OR toYear IS NULL OR
                                hdlv_temp2.NAM_TOT_NGHIEP <= toYear)
                        ) AS "danhSachHoTen",

                        (Select listagg(hdlv_temp3.TEN_LUAN_VAN || ' ', '??') within group ( order by null)
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp3
                         WHERE hdlv_temp3.SHCC = hdlv.SHCC
                           AND (hdlv_temp3.NAM_TOT_NGHIEP IS NULL OR fromYear IS NULL OR
                                hdlv_temp3.NAM_TOT_NGHIEP >= fromYear)
                           AND (hdlv_temp3.NAM_TOT_NGHIEP IS NULL OR toYear IS NULL OR
                                hdlv_temp3.NAM_TOT_NGHIEP <= toYear)
                        ) AS "danhSachDeTai",

                        dv.MA               AS               "maDonVi",
                        dv.TEN              AS               "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM (SELECT *
                        FROM QT_HUONG_DAN_LUAN_VAN
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HUONG_DAN_LUAN_VAN ORDER BY SHCC DESC ) GROUP BY SHCC)) hdlv
                        LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                        LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, hdlv.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear)
                  AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear)
                  AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
                     OR LOWER(hdlv.SAN_PHAM) LIKE sT)
                 ORDER BY hdlv.NAM_TOT_NGHIEP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HUONG_DAN_LUAN_VAN_GROUP_PAGE_SHCC(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                      loaiDoiTuong IN STRING,
                                                      searchTerm IN STRING,
                                                      totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HUONG_DAN_LUAN_VAN hdlv
             LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA)
      AND (hdlv.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdlv.ID             AS               "id",
                        hdlv.SHCC           AS               "shcc",
                        hdlv.TEN_LUAN_VAN   AS               "tenLuanVan",
                        hdlv.HO_TEN         AS               "hoTen",
                        hdlv.NAM_TOT_NGHIEP AS               "namTotNghiep",
                        hdlv.BAC_DAO_TAO    AS               "bacDaoTao",
                        hdlv.SAN_PHAM       AS               "sanPham",
                        cb.HO               AS               "hoCanBo",
                        cb.TEN              AS               "tenCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                 FROM QT_HUONG_DAN_LUAN_VAN hdlv
                          LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA)
                   AND (hdlv.SHCC = searchTerm)
                 ORDER BY hdlv.NAM_TOT_NGHIEP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HUONG_DAN_LUAN_VAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HUONG_DAN_LUAN_VAN hdlv
             LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, hdlv.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear)
      AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
        OR LOWER(hdlv.SAN_PHAM) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdlv.ID             AS               "id",
                        hdlv.TEN_LUAN_VAN   AS               "tenLuanVan",
                        hdlv.HO_TEN         AS               "hoTen",
                        hdlv.SHCC           as               "shcc",
                        hdlv.NAM_TOT_NGHIEP AS               "namTotNghiep",
                        hdlv.BAC_DAO_TAO    AS               "bacDaoTao",
                        hdlv.SAN_PHAM       AS               "sanPham",
                        cb.HO               AS               "hoCanBo",
                        cb.TEN              AS               "tenCanBo",

                        dv.MA               AS               "maDonVi",
                        dv.TEN              AS               "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                 FROM QT_HUONG_DAN_LUAN_VAN hdlv
                          LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, hdlv.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear)
                  AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear)
                  AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(hdlv.TEN_LUAN_VAN) LIKE sT
                     OR LOWER(hdlv.SAN_PHAM) LIKE sT)
                 ORDER BY hdlv.NAM_TOT_NGHIEP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_GET_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
         SELECT
                kdct.ID             as  "id",
                kdct.BAT_DAU        as  "batDau",
                kdct.BAT_DAU_TYPE   as  "batDauType",
                kdct.KET_THUC       as  "ketThuc",
                kdct.KET_THUC_TYPE  as  "ketThucType",
                kdct.SO_HIEU_VAN_BAN        as  "soHieuVanBan",
                dv.MA              AS                       "maDonVi",
                dv.TEN             AS                       "tenDonVi",

                ROW_NUMBER() OVER (ORDER BY kdct.KET_THUC DESC ) R
         FROM QT_KEO_DAI_CONG_TAC kdct
                  LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                  LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
        WHERE kdct.SHCC = isSHCC;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
            FROM QT_KEO_DAI_CONG_TAC
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (list_shcc IS NULL OR INSTR(list_shcc, kdct.SHCC) != 0)
      AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        kdct.ID             as  "id",
                        kdct.SHCC           as  "shcc",
                        kdct.BAT_DAU        as  "batDau",
                        kdct.BAT_DAU_TYPE   as  "batDauType",
                        kdct.KET_THUC       as  "ketThuc",
                        kdct.KET_THUC_TYPE  as  "ketThucType",
                        kdct.SO_HIEU_VAN_BAN        as  "soHieuVanBan",
                        
                        (SELECT COUNT(*)
                         FROM QT_KEO_DAI_CONG_TAC kdct_temp
                         WHERE kdct_temp.SHCC = kdct.SHCC
                           AND (kdct_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                                kdct_temp.BAT_DAU >= fromYear)
                           AND (kdct_temp.KET_THUC IS NULL OR toYear IS NULL OR
                                kdct_temp.KET_THUC <= toYear)
                        ) AS "soQuaTrinh",

                        (Select listagg(kdct_temp2.BAT_DAU || ' ', '??') within group ( order by null)
                         from QT_KEO_DAI_CONG_TAC kdct_temp2
                         WHERE kdct_temp2.SHCC = kdct.SHCC
                           AND (kdct_temp2.BAT_DAU IS NULL OR fromYear IS NULL OR
                                kdct_temp2.BAT_DAU >= fromYear)
                           AND (kdct_temp2.KET_THUC IS NULL OR toYear IS NULL OR
                                kdct_temp2.KET_THUC <= toYear)) AS "danhSachBatDau",

                        (Select listagg(kdct_temp3.KET_THUC || ' ', '??') within group ( order by null)
                         from QT_KEO_DAI_CONG_TAC kdct_temp3
                         WHERE kdct_temp3.SHCC = kdct.SHCC
                           AND (kdct_temp3.BAT_DAU IS NULL OR fromYear IS NULL OR
                                kdct_temp3.BAT_DAU >= fromYear)
                           AND (kdct_temp3.KET_THUC IS NULL OR toYear IS NULL OR
                                kdct_temp3.KET_THUC <= toYear)) AS "danhSachKetThuc",

                        (Select listagg(kdct_temp4.KET_THUC_TYPE || ' ', '??') within group ( order by null)
                         from QT_KEO_DAI_CONG_TAC kdct_temp4
                         WHERE kdct_temp4.SHCC = kdct.SHCC
                           AND (kdct_temp4.BAT_DAU IS NULL OR fromYear IS NULL OR
                                kdct_temp4.BAT_DAU >= fromYear)
                           AND (kdct_temp4.KET_THUC IS NULL OR toYear IS NULL OR
                                kdct_temp4.KET_THUC <= toYear)) AS "danhSachKetThucType",

                        (Select listagg(kdct_temp5.BAT_DAU_TYPE || ' ', '??') within group ( order by null)
                         from QT_KEO_DAI_CONG_TAC kdct_temp5
                         WHERE kdct_temp5.SHCC = kdct.SHCC
                           AND (kdct_temp5.BAT_DAU IS NULL OR fromYear IS NULL OR
                                kdct_temp5.BAT_DAU >= fromYear)
                           AND (kdct_temp5.KET_THUC IS NULL OR toYear IS NULL OR
                                kdct_temp5.KET_THUC <= toYear) ) AS "danhSachBatDauType",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",


                        ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC ) R
                FROM (SELECT *
                        FROM QT_KEO_DAI_CONG_TAC
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) kdct
                         LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (list_shcc IS NULL OR INSTR(list_shcc, kdct.SHCC) != 0)
                  AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                ORDER BY kdct.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KEO_DAI_CONG_TAC kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (list_shcc IS NULL OR INSTR(list_shcc, kdct.SHCC) != 0)
      AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
      AND (fromYear IS NULL OR kdct.BAT_DAU IS NULL OR kdct.BAT_DAU >= fromYear)
      AND (toYear IS NULL OR kdct.KET_THUC IS NULL OR kdct.KET_THUC <= toYear)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        kdct.ID             as  "id",
                        kdct.SHCC           as  "shcc",
                        kdct.BAT_DAU        as  "batDau",
                        kdct.BAT_DAU_TYPE   as  "batDauType",
                        kdct.KET_THUC       as  "ketThuc",
                        kdct.KET_THUC_TYPE  as  "ketThucType",
                        kdct.SO_HIEU_VAN_BAN        as  "soHieuVanBan",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY kdct.KET_THUC DESC) R
                 FROM QT_KEO_DAI_CONG_TAC kdct
                          LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (list_shcc IS NULL OR INSTR(list_shcc, kdct.SHCC) != 0)
                   AND (list_dv IS NULL OR INSTR(list_dv, cb.MA_DON_VI) != 0)
                   AND (fromYear IS NULL OR kdct.BAT_DAU IS NULL OR kdct.BAT_DAU >= fromYear)
                   AND (toYear IS NULL OR kdct.KET_THUC IS NULL OR kdct.KET_THUC <= toYear)
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE ST
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                 ORDER BY kdct.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_BY_SHCC(isSHCC IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT qtkta.MA           AS                "ma",
               qtkta.ID           AS                "id",
               qtkta.nam_dat_duoc AS                "namDatDuoc",
               qtkta.DIEM_THI_DUA AS                "diemThiDua",

               ldt.MA             AS                "maLoaiDoiTuong",
               ldt.TEN            AS                "tenLoaiDoiTuong",

               cb.SHCC            AS                "maCanBo",
               cb.HO              AS                "hoCanBo",
               cb.TEN             AS                "tenCanBo",

               ktkh.MA            AS                "maThanhTich",
               ktkh.TEN           AS                "tenThanhTich",

               ktct.MA            AS                "maChuThich",
               ktct.TEN           AS                "tenChuThich",
               ROW_NUMBER() OVER (ORDER BY NAM_DAT_DUOC DESC) R
        FROM QT_KHEN_THUONG_ALL qtkta
                 LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                 LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                 LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
                 LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
        WHERE qtkta.MA = isSHCC
          AND qtkta.LOAI_DOI_TUONG = '02';
    RETURN my_cursor;
end;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                  fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT * 
            FROM QT_KHEN_THUONG_ALL 
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_KHEN_THUONG_ALL ORDER BY MA DESC ) GROUP BY MA)) qtkta        
            LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
            LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
            LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
            LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
            LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
            LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
            LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
    WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(ldt.TEN) like sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(bm.TEN)) LIKE sT
       OR qtkta.NAM_DAT_DUOC LIKE sT
       OR LOWER(TRIM(ktct.TEN)) LIKE sT
       OR LOWER(TRIM(ktkh.ten)) LIKE sT);

    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA    AS  "ma",
                        qtkta.ID    AS  "id",
                        qtkta.nam_dat_duoc  AS "namDatDuoc",
                        qtkta.DIEM_THI_DUA AS                "diemThiDua",

                        (SELECT COUNT(*)
                         FROM QT_KHEN_THUONG_ALL qtkta_temp
                         WHERE TO_CHAR(qtkta_temp.MA) = TO_CHAR(qtkta.MA)
                           AND (qtkta_temp.LOAI_DOI_TUONG = qtkta.LOAI_DOI_TUONG)
                           AND (qtkta_temp.NAM_DAT_DUOC IS NULL OR fromYear IS NULL OR
                                (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) >= fromYear))
                           AND (qtkta_temp.NAM_DAT_DUOC IS NULL OR toYear IS NULL OR
                                (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) <= toYear))
                        ) AS "soKhenThuong",

                        ldt.MA  AS "maLoaiDoiTuong",
                        ldt.TEN AS "tenLoaiDoiTuong",

                        cb.SHCC AS "maCanBo",
                        cb.HO   AS  "hoCanBo",
                        cb.TEN  AS  "tenCanBo",

                        dv.MA   AS "maDonVi",
                        dv.TEN  AS "tenDonVi",

                        bm.MA   AS "maBoMon",
                        bm.TEN  AS "tenBoMon",
                        bm.MA_DV AS "maDonViBoMon",
                        dv2.TEN  AS "tenDonViBoMon",
                        
                        ktkh.MA AS "maThanhTich",
                        ktkh.TEN    AS  "tenThanhTich",

                        ktct.MA AS  "maChuThich",
                        ktct.TEN    AS  "tenChuThich",
                        ROW_NUMBER() OVER (ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC) R
                FROM (SELECT * 
                        FROM QT_KHEN_THUONG_ALL 
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_KHEN_THUONG_ALL ORDER BY MA DESC ) GROUP BY MA)) qtkta                   
                        LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                        LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                        LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
                        LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
                        LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
                        LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
                        LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
                WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(ldt.TEN) like sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(TRIM(dv.TEN)) LIKE sT
                   OR LOWER(TRIM(bm.TEN)) LIKE sT
                   OR qtkta.NAM_DAT_DUOC LIKE sT
                   OR LOWER(TRIM(ktct.TEN)) LIKE sT
                   OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
            )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                            maDT IN STRING, fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KHEN_THUONG_ALL qtkta
             LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
             LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
             LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
             LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
             LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
             LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
             LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
    WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
        AND (maDT IS NULL OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG and qtkta.MA = TO_CHAR(maDT)))
        AND (qtkta.NAM_DAT_DUOC IS NULL OR fromYear IS NULL OR (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear))
        AND (qtkta.NAM_DAT_DUOC IS NULL OR toYear IS NULL OR (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(bm.TEN)) LIKE sT
       OR LOWER(ldt.TEN) like sT
       OR qtkta.NAM_DAT_DUOC LIKE sT
       OR LOWER(TRIM(ktct.TEN)) LIKE sT
       OR LOWER(TRIM(ktkh.ten)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA           AS                "ma",
                        qtkta.ID           AS                "id",
                        qtkta.nam_dat_duoc AS                "namDatDuoc",
                        qtkta.DIEM_THI_DUA AS                "diemThiDua",

                        ldt.MA             AS                "maLoaiDoiTuong",
                        ldt.TEN            AS                "tenLoaiDoiTuong",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        bm.MA              AS                "maBoMon",
                        bm.TEN             AS                "tenBoMon",
                        bm.MA_DV           AS                "maDonViBoMon",
                        dv2.TEN            AS                "tenDonViBoMon",

                        ktkh.MA            AS                "maThanhTich",
                        ktkh.TEN           AS                "tenThanhTich",

                        ktct.MA            AS                "maChuThich",
                        ktct.TEN           AS                "tenChuThich",
                        ROW_NUMBER() OVER (ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC) R
                 FROM QT_KHEN_THUONG_ALL qtkta
                          LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta.LOAI_DOI_TUONG
                          LEFT JOIN TCHC_CAN_BO cb on (qtkta.LOAI_DOI_TUONG = '02' and qtkta.MA = cb.SHCC)
                          LEFT JOIN DM_DON_VI dv on (qtkta.LOAI_DOI_TUONG = '03' and qtkta.MA = TO_CHAR(dv.MA))
                          LEFT JOIN DM_BO_MON bm on (qtkta.LOAI_DOI_TUONG = '04' and qtkta.MA = TO_CHAR(bm.MA))
                          LEFT JOIN DM_DON_VI dv2 on (bm.MA_DV = dv2.ma)
                          LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta.THANH_TICH = ktkh.MA
                          LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta.CHU_THICH = ktct.MA
                WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
                    AND (maDT IS NULL OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG and qtkta.MA = TO_CHAR(maDT)))
                    AND (qtkta.NAM_DAT_DUOC IS NULL OR fromYear IS NULL OR (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear))
                    AND (qtkta.NAM_DAT_DUOC IS NULL OR toYear IS NULL OR (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear))
                    AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(TRIM(dv.TEN)) LIKE sT
                    OR LOWER(TRIM(bm.TEN)) LIKE sT
                    OR LOWER(ldt.TEN) like sT
                    OR qtkta.NAM_DAT_DUOC LIKE sT
                    OR LOWER(TRIM(ktct.TEN)) LIKE sT
                    OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_CA_NHAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KHEN_THUONG_CA_NHAN qtktcn
                LEFT JOIN TCHC_CAN_BO cb on qtktcn.SHCC = cb.SHCC
                LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtktcn.THANH_TICH = ktkh.MA
                LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtktcn.CHU_THICH = ktct.MA
    WHERE searchTerm = ''
        OR LOWER(qtktcn.SHCC) LIKE sT
        OR qtktcn.NAM_DAT_DUOC LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(ktct.TEN) LIKE sT
        OR LOWER(ktkh.ten) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtktcn.SHCC                           AS  "shcc",
                        qtktcn.ID                           AS  "id",
                        qtktcn.nam_dat_duoc                 AS "namDatDuoc",
                        cb.HO                               AS  "ho",
                        cb.TEN                              AS  "ten",
                        ktkh.MA                             AS "maThanhTich",
                        ktkh.TEN                              AS  "tenThanhTich",
                        ktct.MA                              AS  "maChuThich",
                        ktct.TEN                              AS  "tenChuThich",
                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM QT_KHEN_THUONG_CA_NHAN qtktcn
                    LEFT JOIN TCHC_CAN_BO cb on qtktcn.SHCC = cb.SHCC
                    LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtktcn.THANH_TICH = ktkh.MA
                    LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtktcn.CHU_THICH = ktct.MA
                WHERE searchTerm = ''
                    OR LOWER(qtktcn.SHCC) LIKE sT
                    OR qtktcn.NAM_DAT_DUOC LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(ktct.TEN) LIKE sT
                    OR LOWER(ktkh.ten) LIKE sT
                    ORDER BY qtktcn.ID DESC
            )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT qtkl.ID              AS              "id",
               qtkl.LY_DO_HINH_THUC AS              "lyDoHinhThuc",
               qtkl.BAT_DAU         AS              "batDau",
               qtkl.BAT_DAU_TYPE    AS              "batDauType",
               qtkl.KET_THUC        AS              "ketThuc",
               qtkl.KET_THUC_TYPE   AS              "ketThucType",
               qtkl.CAP_QUYET_DINH  AS              "capQuyetDinh",
               qtkl.DIEM_THI_DUA    AS              "diemThiDua",

               dmkl.TEN             AS              "tenKyLuat",
               cb.SHCC              AS              "maCanBo",
               cb.HO                AS              "hoCanBo",
               cb.TEN               AS              "tenCanBo",

               dv.MA                AS              "maDonVi",
               dv.TEN               AS              "tenDonVi",
               qtkl.NOI_DUNG        AS              "noiDung",
               ROW_NUMBER() OVER (ORDER BY ID DESC) R
        FROM QT_KY_LUAT qtkl
                 LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
        WHERE INSTR(isSHCC, qtkl.SHCC) != 0;
    return my_cursor;
end;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_KY_LUAT
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_KY_LUAT ORDER BY SHCC DESC ) GROUP BY SHCC)) qtkl
             LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtkl.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL));

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkl.ID           AS                "id",

                        (SELECT COUNT(*)
                         FROM QT_KY_LUAT qtkl_temp
                            LEFT JOIN TCHC_CAN_BO cb_temp on qtkl_temp.SHCC = cb_temp.SHCC
                            LEFT JOIN DM_DON_VI dv_temp on cb_temp.MA_DON_VI = TO_CHAR(dv_temp.MA)
                            LEFT JOIN DM_KY_LUAT dmkl_temp ON qtkl_temp.LY_DO_HINH_THUC = dmkl_temp.MA
                         WHERE qtkl_temp.SHCC = qtkl.SHCC
                           AND (qtkl_temp.BAT_DAU IS NULL OR fromYear IS NULL OR
                                qtkl_temp.BAT_DAU >= fromYear)
                           AND (qtkl_temp.KET_THUC IS NULL OR toYear IS NULL OR
                                qtkl_temp.KET_THUC <= toYear)
                           AND (searchTerm = ''
                            OR LOWER(cb_temp.SHCC) LIKE sT
                            OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                            OR LOWER(dmkl_temp.TEN) LIKE sT
                            OR LOWER(qtkl_temp.CAP_QUYET_DINH) LIKE sT
                            OR LOWER(TRIM(cb_temp.HO || ' ' || cb_temp.TEN)) LIKE sT)
                        ) AS "soKyLuat",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        ROW_NUMBER() OVER (ORDER BY qtkl.KET_THUC DESC) R
                FROM (SELECT *
                        FROM QT_KY_LUAT
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_KY_LUAT ORDER BY SHCC DESC ) GROUP BY SHCC)) qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = TO_CHAR(dv.MA))
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtkl.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                 ORDER BY qtkl.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KY_LUAT qtkl
             LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
    WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtkl.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkl.ID           AS                "id",
                        qtkl.LY_DO_HINH_THUC    AS "lyDoHinhThuc",
                        qtkl.BAT_DAU    AS "batDau",
                        qtkl.BAT_DAU_TYPE AS "batDauType",
                        qtkl.KET_THUC   AS "ketThuc",
                        qtkl.KET_THUC_TYPE  AS "ketThucType",
                        qtkl.CAP_QUYET_DINH AS "capQuyetDinh",
                        qtkl.DIEM_THI_DUA   AS "diemThiDua",

                        dmkl.TEN           AS   "tenKyLuat",
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM QT_KY_LUAT qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtkl.SHCC = searchTerm)
                ORDER BY qtkl.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KY_LUAT qtkl
             LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtkl.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR qtkl.BAT_DAU IS NULL OR qtkl.BAT_DAU >= fromYear)
      AND (toYear IS NULL OR qtkl.KET_THUC IS NULL OR qtkl.KET_THUC <= toYear)
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(qtkl.NOI_DUNG) LIKE sT
       OR LOWER(dmkl.TEN) LIKE sT
       OR LOWER(qtkl.CAP_QUYET_DINH) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkl.ID           AS                "id",
                        qtkl.LY_DO_HINH_THUC    AS "lyDoHinhThuc",
                        qtkl.BAT_DAU    AS "batDau",
                        qtkl.BAT_DAU_TYPE AS "batDauType",
                        qtkl.KET_THUC   AS "ketThuc",
                        qtkl.KET_THUC_TYPE  AS "ketThucType",
                        qtkl.CAP_QUYET_DINH AS "capQuyetDinh",
                        qtkl.DIEM_THI_DUA   AS "diemThiDua",
                        qtkl.NOI_DUNG   AS "noiDung",

                        dmkl.TEN           AS   "tenKyLuat",
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY KET_THUC DESC) R
                FROM QT_KY_LUAT qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtkl.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR qtkl.BAT_DAU IS NULL OR qtkl.BAT_DAU >= fromYear)
                  AND (toYear IS NULL OR qtkl.KET_THUC IS NULL OR qtkl.KET_THUC <= toYear)
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(qtkl.NOI_DUNG) LIKE sT
                    OR LOWER(dmkl.TEN) LIKE sT
                    OR LOWER(qtkl.CAP_QUYET_DINH) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                 ORDER BY qtkl.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_LUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtl
             LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtl.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
        OR LOWER(qtl.CHUC_DANH_NGHE_NGHIEP) LIKE sT
        OR LOWER(qtl.SO_HIEU_VAN_BAN) LIKE sT;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        qtl.SHCC    as "shcc",
                        qtl.ID                              AS  "id",
                        cb.HO                               AS  "ho",
                        cb.TEN                              AS  "ten",
                        qtl.BAT_DAU                         AS  "batDau",
                        qtl.BAT_DAU_TYPE                    as  "batDauType",
                        qtl.KET_THUC                        as  "ketThuc",
                        qtl.KET_THUC_TYPE                   as  "ketThucType",
                        qtl.CHUC_DANH_NGHE_NGHIEP           as  "chucDanhNgheNghiep",
                        qtl.BAC                             as  "bac",
                        qtl.HE_SO_LUONG                     as  "heSoLuong",
                        qtl.PHU_CAP_THAM_NIEN_VUOT_KHUNG    as  "phuCapThamNienVuotKhung",
                        qtl.NGAY_HUONG                      as  "ngayHuong",
                        qtl.MOC_NANG_BAC_LUONG              as  "mocNangBacLuong",
                        qtl.SO_HIEU_VAN_BAN                 as  "soHieuVanBan",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        (SELECT COUNT(*)
                         FROM QT_LUONG qtl_temp
                         WHERE qtl_temp.SHCC = qtl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtl_temp.BAT_DAU IS NULL OR qtl_temp.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtl_temp.KET_THUC IS NULL OR qtl_temp.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtl_temp.NGAY_HUONG IS NULL OR qtl_temp.NGAY_HUONG >= fromYear)
                            AND (toYear IS NULL OR qtl_temp.NGAY_HUONG IS NULL OR qtl_temp.NGAY_HUONG <= toYear)))
                        ) AS "soChucDanh",
                        
                        (Select listagg(qtl_temp3.CHUC_DANH_NGHE_NGHIEP || ' ', '??') within group ( order by null)
                         FROM QT_LUONG qtl_temp3
                         WHERE qtl_temp3.SHCC = qtl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtl_temp3.BAT_DAU IS NULL OR qtl_temp3.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtl_temp3.KET_THUC IS NULL OR qtl_temp3.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtl_temp3.NGAY_HUONG IS NULL OR qtl_temp3.NGAY_HUONG >= fromYear)
                            AND (toYear IS NULL OR qtl_temp3.NGAY_HUONG IS NULL OR qtl_temp3.NGAY_HUONG <= toYear)))
                        ) AS "danhSachChucDanh",
                        ROW_NUMBER() OVER (ORDER BY qtl.ID) R
                     FROM (SELECT *
                          FROM QT_LUONG
                          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtl
                                          LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
                                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtl.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                    OR LOWER(qtl.CHUC_DANH_NGHE_NGHIEP) LIKE sT
                    OR LOWER(qtl.SO_HIEU_VAN_BAN) LIKE sT
                ORDER BY qtl.NGAY_HUONG
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LUONG_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                           searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_LUONG qtl
             LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
      AND (qtl.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtl.SHCC    as "shcc",
                        qtl.ID                              AS  "id",
                        cb.HO                               AS  "ho",
                        cb.TEN                              AS  "ten",
                        qtl.BAT_DAU                         AS  "batDau",
                        qtl.BAT_DAU_TYPE                    as  "batDauType",
                        qtl.KET_THUC                        as  "ketThuc",
                        qtl.KET_THUC_TYPE                   as  "ketThucType",
                        qtl.CHUC_DANH_NGHE_NGHIEP           as  "chucDanhNgheNghiep",
                        qtl.BAC                             as  "bac",
                        qtl.HE_SO_LUONG                     as  "heSoLuong",
                        qtl.PHU_CAP_THAM_NIEN_VUOT_KHUNG    as  "phuCapThamNienVuotKhung",
                        qtl.NGAY_HUONG                      as  "ngayHuong",
                        qtl.MOC_NANG_BAC_LUONG              as  "mocNangBacLuong",
                        qtl.SO_HIEU_VAN_BAN                 as  "soHieuVanBan",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtl.ID) R
                 FROM QT_LUONG qtl
                          LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
                   AND (qtl.SHCC = searchTerm)
                 ORDER BY qtl.ID
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_LUONG qtl
             LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtl.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (timeType = 1
        AND (fromYear IS NULL OR qtl.BAT_DAU IS NULL OR qtl.BAT_DAU >= fromYear)
        AND (toYear IS NULL OR qtl.KET_THUC IS NULL OR qtl.KET_THUC <= toYear)) OR (timeType = 2
        AND (fromYear IS NULL OR qtl.NGAY_HUONG IS NULL OR qtl.NGAY_HUONG >= fromYear)
        AND (toYear IS NULL OR qtl.NGAY_HUONG IS NULL OR qtl.NGAY_HUONG <= toYear)))
        AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtl.CHUC_DANH_NGHE_NGHIEP) LIKE sT
        OR LOWER(qtl.SO_HIEU_VAN_BAN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtl.SHCC    as "shcc",
                        qtl.ID                              AS  "id",
                        cb.HO                               AS  "ho",
                        cb.TEN                              AS  "ten",
                        qtl.BAT_DAU                         AS  "batDau",
                        qtl.BAT_DAU_TYPE                    as  "batDauType",
                        qtl.KET_THUC                        as  "ketThuc",
                        qtl.KET_THUC_TYPE                   as  "ketThucType",
                        qtl.CHUC_DANH_NGHE_NGHIEP           as  "chucDanhNgheNghiep",
                        qtl.BAC                             as  "bac",
                        qtl.HE_SO_LUONG                     as  "heSoLuong",
                        qtl.PHU_CAP_THAM_NIEN_VUOT_KHUNG    as  "phuCapThamNienVuotKhung",
                        qtl.NGAY_HUONG                      as  "ngayHuong",
                        qtl.MOC_NANG_BAC_LUONG              as  "mocNangBacLuong",
                        qtl.SO_HIEU_VAN_BAN                 as  "soHieuVanBan",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtl.NGAY_HUONG) R
                 FROM QT_LUONG qtl
                          LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtl.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (timeType = 1
                    AND (fromYear IS NULL OR qtl.BAT_DAU IS NULL OR qtl.BAT_DAU >= fromYear)
                    AND (toYear IS NULL OR qtl.KET_THUC IS NULL OR qtl.KET_THUC <= toYear)) OR (timeType = 2
                    AND (fromYear IS NULL OR qtl.NGAY_HUONG IS NULL OR qtl.NGAY_HUONG >= fromYear)
                    AND (toYear IS NULL OR qtl.NGAY_HUONG IS NULL OR qtl.NGAY_HUONG <= toYear)))
                    AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtl.CHUC_DANH_NGHE_NGHIEP) LIKE sT
                    OR LOWER(qtl.SO_HIEU_VAN_BAN) LIKE sT)
                    ORDER BY qtl.NGAY_HUONG DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NCKH_DOWNLOAD_EXCEL(filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
    FROMTIME    NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 1) + 1,
                                      INSTR(filter, '%', 1, 2) - INSTR(filter, '%', 1, 1) - 1);
    TOTIME      NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 2) + 1,
                                      INSTR(filter, '%', 1, 3) - INSTR(filter, '%', 1, 2) - 1);
    LOAI_HOC_VI STRING(15)  := SUBSTR(filter, INSTR(filter, '%', 1, 3) + 1,
                                      INSTR(filter, '%', 1, 4) - INSTR(filter, '%', 1, 3) - 1);
    DON_VI      STRING(200)  := SUBSTR(filter, INSTR(filter, '%', 1, 4) + 1,
                                      INSTR(filter, '%', 1, 5) - INSTR(filter, '%', 1, 4) - 1);
    MASOCB      STRING(200)  := SUBSTR(filter, INSTR(filter, '%', 1, 5) + 1,
                                      INSTR(filter, '%', 1, 6) - INSTR(filter, '%', 1, 5) - 1);
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.ID                                                      AS "id",
                        qtnckh.TEN_DE_TAI                                              AS "tenDeTai",
                        qtnckh.MA_SO_CAP_QUAN_LY                                       AS "maSoCapQuanLy",
                        qtnckh.KINH_PHI                                                AS "kinhPhi",
                        qtnckh.BAT_DAU                                                 AS "batDau",
                        qtnckh.BAT_DAU_TYPE                                            AS "batDauType",
                        qtnckh.KET_THUC                                                AS "ketThuc",
                        qtnckh.KET_THUC_TYPE                                           AS "ketThucType",
                        qtnckh.NGAY_NGHIEM_THU                                         AS "ngayNghiemThu",
                        qtnckh.NGAY_NGHIEM_THU_TYPE                                    AS "ngayNghiemThuType",
                        qtnckh.VAI_TRO                                                 AS "vaiTro",
                        qtnckh.KET_QUA                                                 AS "ketQua",
                        qtnckh.THOI_GIAN                                               AS "thoiGian",
                        qtnckh.SHCC                                                    AS "shcc",

                        CB.HO                                                          AS "hoCanBo",
                        CB.TEN                                                         AS "tenCanBo",
                        (select TEN FROM DM_TRINH_DO WHERE CB.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                 WHERE (filter = '%%%%%%%'
                     OR (
                                ((TO_CHAR(qtnckh.SHCC) IN (select regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.MASOCB, '[^,]+', 1, level)
                                              from dual
                                              connect by
                                                      regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.MASOCB, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_DOWNLOAD_EXCEL.MASOCB IS NULL)
                                AND
                                ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.DON_VI, '[^,]+', 1, level)
                                                   from dual
                                                   connect by
                                                           regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.DON_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_DOWNLOAD_EXCEL.DON_VI IS NULL)
                                AND
                                ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.LOAI_HOC_VI, '[^,]+', 1, level)
                                                from dual
                                                connect by
                                                        regexp_substr(QT_NCKH_DOWNLOAD_EXCEL.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_DOWNLOAD_EXCEL.LOAI_HOC_VI IS NULL)
                                AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                                AND (
                                              (QT_NCKH_DOWNLOAD_EXCEL.FROMTIME IS NULL
                                                  OR (QT_NCKH_DOWNLOAD_EXCEL.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                              AND
                                              (QT_NCKH_DOWNLOAD_EXCEL.TOTIME IS NULL
                                                  OR (QT_NCKH_DOWNLOAD_EXCEL.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                                          )
                                )
                                    )
                            )
                     )
                 ORDER BY qtnckh.NGAY_NGHIEM_THU DESC
             );
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NCKH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                   totalItem OUT NUMBER, pageTotal OUT NUMBER, mscb IN STRING,
                                   filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
    sT          STRING(500) := '%' || lower(searchTerm) || '%';
    FROMTIME    NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 1) + 1,
                                      INSTR(filter, '%', 1, 2) - INSTR(filter, '%', 1, 1) - 1);
    TOTIME      NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 2) + 1,
                                      INSTR(filter, '%', 1, 3) - INSTR(filter, '%', 1, 2) - 1);
    LOAI_HOC_VI STRING(100) := SUBSTR(filter, INSTR(filter, '%', 1, 3) + 1,
                                      INSTR(filter, '%', 1, 4) - INSTR(filter, '%', 1, 3) - 1);
    DON_VI      STRING(100) := SUBSTR(filter, INSTR(filter, '%', 1, 4) + 1,
                                      INSTR(filter, '%', 1, 5) - INSTR(filter, '%', 1, 4) - 1);
    MASOCB      STRING(200) := SUBSTR(filter, INSTR(filter, '%', 1, 5) + 1,
                                      INSTR(filter, '%', 1, 6) - INSTR(filter, '%', 1, 5) - 1);
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHIEN_CUU_KHOA_HOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtnckh
             LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (mscb IS NULL OR mscb = CB.SHCC)
      AND (filter = '%%%%%%%'
        OR (
                   ((TO_CHAR(qtnckh.SHCC) IN (select regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level)
                                              from dual
                                              connect by
                                                      regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_GROUP_PAGE.MASOCB IS NULL)
                   AND
                   ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level)
                                      from dual
                                      connect by
                                              regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_GROUP_PAGE.DON_VI IS NULL)
                   AND ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                       from dual
                                       connect by
                                               regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                   OR QT_NCKH_GROUP_PAGE.LOAI_HOC_VI IS NULL)
                   AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                   AND (
                                 (QT_NCKH_GROUP_PAGE.FROMTIME IS NULL
                                     OR (QT_NCKH_GROUP_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                 AND
                                 (QT_NCKH_GROUP_PAGE.TOTIME IS NULL
                                     OR (QT_NCKH_GROUP_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                             )
                   )
                       )
               )
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE sT
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
        OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
        OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
        OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.SHCC                                                                  AS "shcc",
                        cb.HO                                                                        AS "hoCanBo",
                        cb.TEN                                                                       AS "tenCanBo",
                        (select TEN FROM DM_TRINH_DO WHERE cb.HOC_VI = DM_TRINH_DO.MA)               AS "hocViCanBo",
                        (SELECT COUNT(*) FROM QT_NGHIEN_CUU_KHOA_HOC nc WHERE nc.SHCC = qtnckh.SHCC) AS "soDeTai",
                        (Select listagg(TG.TEN_DE_TAI, '??') within group ( order by null)
                         from QT_NGHIEN_CUU_KHOA_HOC TG
                         where TG.SHCC = qtnckh.SHCC)                                                AS "danhSachDeTai",
                        ROW_NUMBER() OVER (ORDER BY ID DESC)                                            R
                 FROM (SELECT *
                       FROM QT_NGHIEN_CUU_KHOA_HOC
                       WHERE ID IN (SELECT MAX(ID)
                                    FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC)
                                    GROUP BY SHCC)) qtnckh
                          LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (mscb IS NULL OR mscb = CB.SHCC)
                   AND (filter = '%%%%%%%'
                     OR (
                                ((TO_CHAR(qtnckh.SHCC) IN
                                  (select regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(QT_NCKH_GROUP_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_GROUP_PAGE.MASOCB IS NULL)
                                AND
                                ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level)
                                                   from dual
                                                   connect by
                                                           regexp_substr(QT_NCKH_GROUP_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_GROUP_PAGE.DON_VI IS NULL)
                                AND
                                ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                                from dual
                                                connect by
                                                        regexp_substr(QT_NCKH_GROUP_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_GROUP_PAGE.LOAI_HOC_VI IS NULL)
                                AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                                AND (
                                              (QT_NCKH_GROUP_PAGE.FROMTIME IS NULL
                                                  OR (QT_NCKH_GROUP_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                              AND
                                              (QT_NCKH_GROUP_PAGE.TOTIME IS NULL
                                                  OR (QT_NCKH_GROUP_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                                          )
                                )
                                    )
                            )
                     )
                   AND (searchTerm = ''
                     OR LOWER(CB.SHCC) LIKE sT
                     OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                     OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
                     OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
                     OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
                 ORDER BY qtnckh.NGAY_NGHIEM_THU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NCKH_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
             LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtnckh.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.ID           AS                "id",
                        qtnckh.TEN_DE_TAI   AS "tenDeTai",
                        qtnckh.MA_SO_CAP_QUAN_LY    AS "maSoCapQuanLy",
                        qtnckh.KINH_PHI   AS "kinhPhi",
                        qtnckh.BAT_DAU    AS "batDau",
                        qtnckh.BAT_DAU_TYPE AS "batDauType",
                        qtnckh.KET_THUC   AS "ketThuc",
                        qtnckh.KET_THUC_TYPE  AS "ketThucType",
                        qtnckh.NGAY_NGHIEM_THU  AS "ngayNghiemThu",
                        qtnckh.NGAY_NGHIEM_THU_TYPE AS "ngayNghiemThuType",
                        qtnckh.VAI_TRO  AS "vaiTro",
                        qtnckh.KET_QUA  AS "ketQua",
                        qtnckh.THOI_GIAN    AS "thoiGian",
                        qtnckh.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                         LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (loaiDoiTuong = '-1' OR loaiDoiTuong = dv.MA) AND (qtnckh.SHCC = searchTerm)
                ORDER BY qtnckh.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NCKH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, searchTerm IN STRING,
                                    totalItem OUT NUMBER, pageTotal OUT NUMBER, mscb IN STRING,
                                    filter IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
    sT          STRING(500) := '%' || lower(searchTerm) || '%';
    FROMTIME    NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 1) + 1,
                                      INSTR(filter, '%', 1, 2) - INSTR(filter, '%', 1, 1) - 1);
    TOTIME      NUMBER(20)  := SUBSTR(filter, INSTR(filter, '%', 1, 2) + 1,
                                      INSTR(filter, '%', 1, 3) - INSTR(filter, '%', 1, 2) - 1);
    LOAI_HOC_VI STRING(15)  := SUBSTR(filter, INSTR(filter, '%', 1, 3) + 1,
                                      INSTR(filter, '%', 1, 4) - INSTR(filter, '%', 1, 3) - 1);
    DON_VI      STRING(200)  := SUBSTR(filter, INSTR(filter, '%', 1, 4) + 1,
                                      INSTR(filter, '%', 1, 5) - INSTR(filter, '%', 1, 4) - 1);
    MASOCB      STRING(200)  := SUBSTR(filter, INSTR(filter, '%', 1, 5) + 1,
                                      INSTR(filter, '%', 1, 6) - INSTR(filter, '%', 1, 5) - 1);
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
             LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
    WHERE (mscb IS NULL OR mscb = CB.SHCC)
      AND (filter = '%%%%%%%'
        OR (
                   ((TO_CHAR(qtnckh.SHCC) IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level)
                                 from dual
                                 connect by regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_SEARCH_PAGE.MASOCB IS NULL)
                   AND
                   ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level)
                                      from dual
                                      connect by
                                              regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                       OR QT_NCKH_SEARCH_PAGE.DON_VI IS NULL)
                   AND ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                       from dual
                                       connect by
                                               regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                   OR QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI IS NULL)
                   AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                   AND (
                                 (QT_NCKH_SEARCH_PAGE.FROMTIME IS NULL
                                     OR (QT_NCKH_SEARCH_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                 AND
                                 (QT_NCKH_SEARCH_PAGE.TOTIME IS NULL
                                     OR (QT_NCKH_SEARCH_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                             )
                   )
                       )
               )
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE sT
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
        OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
        OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
        OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.ID                                                      AS "id",
                        qtnckh.TEN_DE_TAI                                              AS "tenDeTai",
                        qtnckh.MA_SO_CAP_QUAN_LY                                       AS "maSoCapQuanLy",
                        qtnckh.KINH_PHI                                                AS "kinhPhi",
                        qtnckh.BAT_DAU                                                 AS "batDau",
                        qtnckh.BAT_DAU_TYPE                                            AS "batDauType",
                        qtnckh.KET_THUC                                                AS "ketThuc",
                        qtnckh.KET_THUC_TYPE                                           AS "ketThucType",
                        qtnckh.NGAY_NGHIEM_THU                                         AS "ngayNghiemThu",
                        qtnckh.NGAY_NGHIEM_THU_TYPE                                    AS "ngayNghiemThuType",
                        qtnckh.VAI_TRO                                                 AS "vaiTro",
                        qtnckh.KET_QUA                                                 AS "ketQua",
                        qtnckh.THOI_GIAN                                               AS "thoiGian",
                        qtnckh.SHCC                                                    AS "shcc",

                        CB.HO                                                          AS "hoCanBo",
                        CB.TEN                                                         AS "tenCanBo",
                        (select TEN FROM DM_TRINH_DO WHERE CB.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                 WHERE (mscb IS NULL OR mscb = CB.SHCC)
                   AND (filter = '%%%%%%%'
                     OR (
                                ((TO_CHAR(qtnckh.SHCC) IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level)
                                              from dual
                                              connect by
                                                      regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_SEARCH_PAGE.MASOCB IS NULL)
                                AND
                                ((CB.MA_DON_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level)
                                                   from dual
                                                   connect by
                                                           regexp_substr(QT_NCKH_SEARCH_PAGE.DON_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_SEARCH_PAGE.DON_VI IS NULL)
                                AND
                                ((CB.HOC_VI IN (select regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level)
                                                from dual
                                                connect by
                                                        regexp_substr(QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI, '[^,]+', 1, level) is not null))
                                    OR QT_NCKH_SEARCH_PAGE.LOAI_HOC_VI IS NULL)
                                AND ((qtnckh.NGAY_NGHIEM_THU IS NOT NULL
                                AND (
                                              (QT_NCKH_SEARCH_PAGE.FROMTIME IS NULL
                                                  OR (QT_NCKH_SEARCH_PAGE.FROMTIME <= qtnckh.NGAY_NGHIEM_THU))
                                              AND
                                              (QT_NCKH_SEARCH_PAGE.TOTIME IS NULL
                                                  OR (QT_NCKH_SEARCH_PAGE.TOTIME >= qtnckh.NGAY_NGHIEM_THU))
                                          )
                                )
                                    )
                            )
                     )
                   AND (searchTerm = ''
                     OR LOWER(CB.SHCC) LIKE sT
                     OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                     OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
                     OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
                     OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
                 ORDER BY qtnckh.NGAY_NGHIEM_THU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_USER_PAGE(staffEMAIL IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT NCKH.SHCC                 AS              "shcc",
               NCKH.ID                   AS              "id",
               NCKH.TEN_DE_TAI           AS              "tenDeTai",
               NCKH.MA_SO_CAP_QUAN_LY    AS              "maSoCapQuanLy",
               NCKH.KINH_PHI             AS              "kinhPhi",
               NCKH.BAT_DAU              AS              "batDau",
               NCKH.BAT_DAU_TYPE         AS              "batDauType",
               NCKH.KET_THUC             AS              "ketThuc",
               NCKH.KET_THUC_TYPE        AS              "ketThucType",
               NCKH.NGAY_NGHIEM_THU      AS              "ngayNghiemThu",
               NCKH.NGAY_NGHIEM_THU_TYPE AS              "ngayNghiemThuType",
               NCKH.VAI_TRO              AS              "vaiTro",
               NCKH.KET_QUA              AS              "ketQua",
               NCKH.THOI_GIAN            AS              "thoiGian",
               NCKH.SHCC                 AS              "shcc",

               cb.HO                     AS              "hoCanBo",
               cb.TEN                    AS              "tenCanBo",
               ROW_NUMBER() OVER (ORDER BY NCKH.ID DESC) R
        FROM QT_NGHIEN_CUU_KHOA_HOC NCKH
                 LEFT JOIN TCHC_CAN_BO cb ON NCKH.SHCC = cb.SHCC
        WHERE cb.EMAIL = staffEMAIL
        ORDER BY NCKH.NGAY_NGHIEM_THU DESC ;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_THAI_SAN
          WHERE STT IN (SELECT MAX(STT) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) nts
             LEFT JOIN TCHC_CAN_BO cb on nts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, nts.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
        AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(nts.HO_SO_THAI_DUOC_DUYET) LIKE sT
        OR LOWER(nts.SO_BHXH) LIKE sT
        OR LOWER(nts.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        nts.SHCC                        AS      "shcc",
                        nts.STT                         AS      "stt",
                        cb.HO                           AS      "ho",
                        cb.TEN                          AS      "ten",
                        nts.CHUC_VU                     AS      "chucVu",
                        cv.TEN                          AS      "tenChucVu",
                        nts.THOI_GIAN_BAT_DAU_NGHI      AS      "thoiGianBatDauNghi",
                        nts.THOI_GIAN_KET_THUC_NGHI     AS      "thoiGianKetThucNghi",
                        nts.THOI_GIAN_DI_LAM_LAI        AS      "thoiGianDiLamLai",
                        nts.THOI_GIAN_BAO_TANG_BEN_BHXH AS      "thoiGianBaoTangBenBhxh",
                        nts.DA_NOP_HO_SO_THAI_SAN       AS      "daNopHoSoThaiSan",
                        nts.SO_THANG_DUOC_NGHI          AS      "soThangDuocNghi",
                        nts.HO_SO_THAI_DUOC_DUYET       AS      "hoSoThaiSanDuocDuyet",
                        nts.GHI_CHU                     AS      "ghiChu",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        (SELECT COUNT(*)
                         FROM QT_NGHI_THAI_SAN nts_temp
                         WHERE nts_temp.SHCC = nts.SHCC
                           AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI >= fromYear)
                            AND (toYear IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI >= fromYear)
                            AND (toYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI <= toYear)))
                        ) AS "soLanNghi",

                        (Select listagg(nts_temp2.THOI_GIAN_BAT_DAU_NGHI || ' ', '??') within group ( order by null)
                         FROM QT_NGHI_THAI_SAN nts_temp2
                         WHERE nts_temp2.SHCC = nts.SHCC
                           AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI >= fromYear)
                            AND (toYear IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI >= fromYear)
                            AND (toYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI <= toYear)))
                        ) AS "danhSachBatDauNghi",

                        (Select listagg(nts_temp3.THOI_GIAN_KET_THUC_NGHI || ' ', '??') within group ( order by null)
                         FROM QT_NGHI_THAI_SAN nts_temp3
                         WHERE nts_temp3.SHCC = nts.SHCC
                           AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI >= fromYear)
                            AND (toYear IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI >= fromYear)
                            AND (toYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI <= toYear)))
                        ) AS "danhSachKetThucNghi",

                        ROW_NUMBER() OVER (ORDER BY nts.THOI_GIAN_DI_LAM_LAI) R
                     FROM (SELECT *
                          FROM QT_NGHI_THAI_SAN
                          WHERE STT IN (SELECT MAX(STT) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) nts
                                          LEFT JOIN TCHC_CAN_BO cb on nts.SHCC = cb.SHCC
                                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                        LEFT JOIN DM_CHUC_VU cv on nts.CHUC_VU = cv.MA
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, nts.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(nts.HO_SO_THAI_DUOC_DUYET) LIKE sT
                    OR LOWER(nts.SO_BHXH) LIKE sT
                    OR LOWER(nts.GHI_CHU) LIKE sT)
                    ORDER BY nts.THOI_GIAN_DI_LAM_LAI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_THAI_SAN nts
             LEFT JOIN TCHC_CAN_BO cb on nts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, nts.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (timeType = 1
        AND (fromYear IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI >= fromYear)
        AND (toYear IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI <= toYear)) OR (timeType = 2
        AND (fromYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI >= fromYear)
        AND (toYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI <= toYear)))
        AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(nts.HO_SO_THAI_DUOC_DUYET) LIKE sT
        OR LOWER(nts.SO_BHXH) LIKE sT
        OR LOWER(nts.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT nts.SHCC                        AS      "shcc",
                        nts.STT                         AS      "stt",
                        cb.HO                           AS      "ho",
                        cb.TEN                          AS      "ten",
                        nts.CHUC_VU                     AS      "chucVu",
                        cv.TEN                          AS      "tenChucVu",
                        nts.THOI_GIAN_BAT_DAU_NGHI      AS      "thoiGianBatDauNghi",
                        nts.THOI_GIAN_KET_THUC_NGHI     AS      "thoiGianKetThucNghi",
                        nts.THOI_GIAN_DI_LAM_LAI        AS      "thoiGianDiLamLai",
                        nts.THOI_GIAN_BAO_TANG_BEN_BHXH AS      "thoiGianBaoTangBenBhxh",
                        nts.DA_NOP_HO_SO_THAI_SAN       AS      "daNopHoSoThaiSan",
                        nts.SO_THANG_DUOC_NGHI          AS      "soThangDuocNghi",
                        nts.HO_SO_THAI_DUOC_DUYET       AS      "hoSoThaiSanDuocDuyet",
                        nts.GHI_CHU                     AS      "ghiChu",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY nts.THOI_GIAN_DI_LAM_LAI) R
                 FROM QT_NGHI_THAI_SAN nts
                          LEFT JOIN TCHC_CAN_BO cb on nts.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv on nts.CHUC_VU = cv.MA
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, nts.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (timeType = 1
                    AND (fromYear IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI IS NULL OR nts.THOI_GIAN_BAT_DAU_NGHI >= fromYear)
                    AND (toYear IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI IS NULL OR nts.THOI_GIAN_KET_THUC_NGHI <= toYear)) OR (timeType = 2
                    AND (fromYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI >= fromYear)
                    AND (toYear IS NULL OR nts.THOI_GIAN_DI_LAM_LAI IS NULL OR nts.THOI_GIAN_DI_LAM_LAI <= toYear)))
                    AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(nts.HO_SO_THAI_DUOC_DUYET) LIKE sT
                    OR LOWER(nts.SO_BHXH) LIKE sT
                    OR LOWER(nts.GHI_CHU) LIKE sT)
                    ORDER BY nts.THOI_GIAN_DI_LAM_LAI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_VIEC
          WHERE MA IN (SELECT MAX(MA) FROM (SELECT * FROM QT_NGHI_VIEC ORDER BY SHCC DESC) GROUP BY SHCC)) qtnv
             LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnv.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
       AND (fromYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI >= fromYear)
       AND (toYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI <= toYear)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnv.HO_TEN) LIKE sT
        OR LOWER(qtnv.NOI_DUNG) LIKE sT
        OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnv.MA            AS                       "ma",
                        qtnv.HO_TEN        AS                       "hoTen",
                        qtnv.SHCC          AS                       "shcc",
                        qtnv.NGAY_NGHI     AS                       "ngayNghi",
                        qtnv.SO_QUYET_DINH AS                       "soQuyetDinh",
                        qtnv.NOI_DUNG      AS                       "noiDung",
                        qtnv.GHI_CHU       AS                       "ghiChu",
                        qtnv.DIEN_NGHI     AS                       "dienNghi",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        (SELECT COUNT(*)
                         FROM QT_NGHI_VIEC qtnv_temp
                         WHERE qtnv_temp.SHCC = qtnv.SHCC
                            AND (fromYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI >= fromYear)
                            AND (toYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI <= toYear)
                        ) AS "soLanNghi",
                        (Select listagg(qtnv_temp3.NOI_DUNG || ' ', '??') within group ( order by null)
                         FROM QT_NGHI_VIEC qtnv_temp3
                         WHERE qtnv_temp3.SHCC = qtnv.SHCC
                            AND (fromYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI >= fromYear)
                            AND (toYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI <= toYear)
                        ) AS "danhSachNghiViec",
                        ROW_NUMBER() OVER (ORDER BY qtnv.NGAY_NGHI DESC) R
                     FROM (SELECT *
          FROM QT_NGHI_VIEC
          WHERE MA IN (SELECT MAX(MA) FROM (SELECT * FROM QT_NGHI_VIEC ORDER BY SHCC DESC) GROUP BY SHCC)) qtnv
                          LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnv.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                   AND (fromYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI >= fromYear)
                   AND (toYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI <= toYear)
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtnv.HO_TEN) LIKE sT
                    OR LOWER(qtnv.NOI_DUNG) LIKE sT
                    OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT)
                 ORDER BY qtnv.NGAY_NGHI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                           searchTerm IN STRING,
                                           totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_VIEC qtnv
             LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
      AND (qtnv.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnv.MA            AS                            "ma",
                        qtnv.HO_TEN        AS                            "hoTen",
                        qtnv.SHCC          AS                            "shcc",
                        qtnv.NGAY_NGHI     AS                            "ngayNghi",
                        qtnv.SO_QUYET_DINH AS                            "soQuyetDinh",
                        qtnv.NOI_DUNG      AS                            "noiDung",
                        qtnv.GHI_CHU       AS                            "ghiChu",
                        qtnv.DIEN_NGHI     AS                            "dienNghi",

                        cb.HO              AS                            "hoCanBo",
                        cb.TEN             AS                            "tenCanBo",

                        dv.MA              AS                            "maDonVi",
                        dv.TEN             AS                            "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtnv.NGAY_NGHI DESC) R
                 FROM QT_NGHI_VIEC qtnv
                          LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0)
                   AND (qtnv.SHCC = searchTerm)
                 ORDER BY qtnv.NGAY_NGHI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_VIEC qtnv
             LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
     WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnv.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
       AND (fromYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI >= fromYear)
       AND (toYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI <= toYear)
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnv.HO_TEN) LIKE sT
        OR LOWER(qtnv.NOI_DUNG) LIKE sT
        OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnv.MA            AS                       "ma",
                        qtnv.HO_TEN        AS                       "hoTen",
                        qtnv.SHCC          AS                       "shcc",
                        qtnv.NGAY_NGHI     AS                       "ngayNghi",
                        qtnv.SO_QUYET_DINH AS                       "soQuyetDinh",
                        qtnv.NOI_DUNG      AS                       "noiDung",
                        qtnv.GHI_CHU       AS                       "ghiChu",
                        qtnv.DIEN_NGHI     AS                       "dienNghi",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtnv.NGAY_NGHI DESC) R
                 FROM QT_NGHI_VIEC qtnv
                          LEFT JOIN TCHC_CAN_BO cb on qtnv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                  WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnv.SHCC) != 0)
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                       AND (fromYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI >= fromYear)
                       AND (toYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI <= toYear)
                      AND (searchTerm = ''
                        OR LOWER(cb.SHCC) LIKE sT
                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                        OR LOWER(qtnv.HO_TEN) LIKE sT
                        OR LOWER(qtnv.NOI_DUNG) LIKE sT
                        OR LOWER(qtnv.SO_QUYET_DINH) LIKE sT)
                 ORDER BY qtnv.NGAY_NGHI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NUOC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_NUOC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtnn
             LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnn.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(qtnn.NOI_DUNG) LIKE sT
       OR LOWER(qtnn.TEN_CO_SO) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnn.ID           AS                "id",
                        qtnn.NOI_DUNG   AS "noiDung",
                        qtnn.QUOC_GIA   AS "quocGia",
                        qtnn.TEN_CO_SO  AS "tenCoSo",
                        qtnn.KINH_PHI   AS "kinhPhi",
                        qtnn.TRO_LAI_CONG_TAC AS "troLaiCongTac",
                        qtnn.BAT_DAU    AS "batDau",
                        qtnn.BAT_DAU_TYPE AS "batDauType",
                        qtnn.KET_THUC   AS "ketThuc",
                        qtnn.KET_THUC_TYPE  AS "ketThucType",
                        qtnn.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        (SELECT COUNT(*)
                         FROM QT_NUOC_NGOAI qtnn_temp
                         WHERE qtnn_temp.SHCC = qtnn.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtnn_temp.BAT_DAU IS NULL OR qtnn_temp.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp.KET_THUC IS NULL OR qtnn_temp.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtnn_temp.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp.TRO_LAI_CONG_TAC >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp.TRO_LAI_CONG_TAC <= toYear)))
                        ) AS "soQuaTrinh",

                        (Select listagg(qtnn_temp2.BAT_DAU || ' ', '??') within group ( order by null)
                         FROM QT_NUOC_NGOAI qtnn_temp2
                         WHERE qtnn_temp2.SHCC = qtnn.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtnn_temp2.BAT_DAU IS NULL OR qtnn_temp2.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp2.KET_THUC IS NULL OR qtnn_temp2.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtnn_temp2.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp2.TRO_LAI_CONG_TAC >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp2.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp2.TRO_LAI_CONG_TAC <= toYear)))
                        ) AS "danhSachBatDau",

                        (Select listagg(qtnn_temp3.KET_THUC || ' ', '??') within group ( order by null)
                         FROM QT_NUOC_NGOAI qtnn_temp3
                         WHERE qtnn_temp3.SHCC = qtnn.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtnn_temp3.BAT_DAU IS NULL OR qtnn_temp3.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp3.KET_THUC IS NULL OR qtnn_temp3.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtnn_temp3.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp3.TRO_LAI_CONG_TAC >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp3.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp3.TRO_LAI_CONG_TAC <= toYear)))
                        ) AS "danhSachKetThuc",

                        (Select listagg(qtnn_temp4.KET_THUC_TYPE || ' ', '??') within group ( order by null)
                         FROM QT_NUOC_NGOAI qtnn_temp4
                         WHERE qtnn_temp4.SHCC = qtnn.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtnn_temp4.BAT_DAU IS NULL OR qtnn_temp4.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp4.KET_THUC IS NULL OR qtnn_temp4.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtnn_temp4.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp4.TRO_LAI_CONG_TAC >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp4.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp4.TRO_LAI_CONG_TAC <= toYear)))
                        ) AS "danhSachKetThucType",

                        (Select listagg(qtnn_temp5.BAT_DAU_TYPE || ' ', '??') within group ( order by null)
                         FROM QT_NUOC_NGOAI qtnn_temp5
                         WHERE qtnn_temp5.SHCC = qtnn.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtnn_temp5.BAT_DAU IS NULL OR qtnn_temp5.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp5.KET_THUC IS NULL OR qtnn_temp5.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtnn_temp5.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp5.TRO_LAI_CONG_TAC >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp5.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp5.TRO_LAI_CONG_TAC <= toYear)))
                        ) AS "danhSachBatDauType",
                        
                        (Select listagg(qtnn_temp6.TRO_LAI_CONG_TAC || ' ', '??') within group ( order by null)
                         FROM QT_NUOC_NGOAI qtnn_temp6
                         WHERE qtnn_temp6.SHCC = qtnn.SHCC
                            AND (timeType = 0 OR (timeType = 1
                            AND (fromYear IS NULL OR qtnn_temp6.BAT_DAU IS NULL OR qtnn_temp6.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp6.KET_THUC IS NULL OR qtnn_temp6.KET_THUC <= toYear)) OR (timeType = 2
                            AND (fromYear IS NULL OR qtnn_temp6.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp6.TRO_LAI_CONG_TAC >= fromYear)
                            AND (toYear IS NULL OR qtnn_temp6.TRO_LAI_CONG_TAC IS NULL OR qtnn_temp6.TRO_LAI_CONG_TAC <= toYear)))
                        ) AS "danhSachTroLaiCongTac",

                        ROW_NUMBER() OVER (ORDER BY KET_THUC DESC) R
                FROM (SELECT *
                      FROM QT_NUOC_NGOAI
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtnn
                         LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnn.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(qtnn.NOI_DUNG) LIKE sT
                   OR LOWER(qtnn.TEN_CO_SO) LIKE sT)
                ORDER BY qtnn.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NUOC_NGOAI_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NUOC_NGOAI qtnn
             LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0) AND (qtnn.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnn.ID           AS                "id",
                        qtnn.NOI_DUNG   AS "noiDung",
                        qtnn.QUOC_GIA   AS "quocGia",
                        qtnn.TEN_CO_SO  AS "tenCoSo",
                        qtnn.KINH_PHI   AS "kinhPhi",
                        qtnn.TRO_LAI_CONG_TAC AS "troLaiCongTac",
                        qtnn.BAT_DAU    AS "batDau",
                        qtnn.BAT_DAU_TYPE AS "batDauType",
                        qtnn.KET_THUC   AS "ketThuc",
                        qtnn.KET_THUC_TYPE  AS "ketThucType",
                        qtnn.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM QT_NUOC_NGOAI qtnn
                         LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0) AND (qtnn.SHCC = searchTerm)
                ORDER BY qtnn.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NUOC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NUOC_NGOAI qtnn
             LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnn.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (timeType = 1
        AND (fromYear IS NULL OR qtnn.BAT_DAU IS NULL OR qtnn.BAT_DAU >= fromYear)
        AND (toYear IS NULL OR qtnn.KET_THUC IS NULL OR qtnn.KET_THUC <= toYear)) OR (timeType = 2
        AND (fromYear IS NULL OR qtnn.TRO_LAI_CONG_TAC IS NULL OR qtnn.TRO_LAI_CONG_TAC >= fromYear)
        AND (toYear IS NULL OR qtnn.TRO_LAI_CONG_TAC IS NULL OR qtnn.TRO_LAI_CONG_TAC <= toYear)))
      AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(qtnn.NOI_DUNG) LIKE sT
       OR LOWER(qtnn.TEN_CO_SO) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnn.ID           AS                "id",
                        qtnn.NOI_DUNG   AS "noiDung",
                        qtnn.QUOC_GIA   AS "quocGia",
                        qtnn.TEN_CO_SO  AS "tenCoSo",
                        qtnn.KINH_PHI   AS "kinhPhi",
                        qtnn.TRO_LAI_CONG_TAC AS "troLaiCongTac",
                        qtnn.BAT_DAU    AS "batDau",
                        qtnn.BAT_DAU_TYPE AS "batDauType",
                        qtnn.KET_THUC   AS "ketThuc",
                        qtnn.KET_THUC_TYPE  AS "ketThucType",
                        qtnn.SHCC            AS                "shcc",
                        
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY KET_THUC DESC) R
                FROM QT_NUOC_NGOAI qtnn
                         LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnn.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (timeType = 1
                    AND (fromYear IS NULL OR qtnn.BAT_DAU IS NULL OR qtnn.BAT_DAU >= fromYear)
                    AND (toYear IS NULL OR qtnn.KET_THUC IS NULL OR qtnn.KET_THUC <= toYear)) OR (timeType = 2
                    AND (fromYear IS NULL OR qtnn.TRO_LAI_CONG_TAC IS NULL OR qtnn.TRO_LAI_CONG_TAC >= fromYear)
                    AND (toYear IS NULL OR qtnn.TRO_LAI_CONG_TAC IS NULL OR qtnn.TRO_LAI_CONG_TAC <= toYear)))
                  AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(qtnn.NOI_DUNG) LIKE sT
                   OR LOWER(qtnn.TEN_CO_SO) LIKE sT)
                ORDER BY qtnn.KET_THUC DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QUAN_HE_GIA_DINH_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    cur SYS_REFCURSOR;
BEGIN
    OPEN cur FOR
        SELECT
               qhcb.ID AS "id",
               qhcb.HO_TEN AS "hoTen",
               qhcb.MOI_QUAN_HE AS "moiQuanHe",
               dmqh.TEN AS "tenMoiQuanHe",
               qhcb.NAM_SINH AS "namSinh",
               qhcb.NGHE_NGHIEP AS "ngheNghiep",
               qhcb.NOI_CONG_TAC AS "noiCongTac",
               qhcb.TYPE AS "type",
               qhcb.DIA_CHI AS "diaChi",
               qhcb.QUE_QUAN AS "queQuan"
        FROM QUAN_HE_CAN_BO qhcb
                 LEFT JOIN DM_QUAN_HE_GIA_DINH dmqh ON dmqh.MA = qhcb.MOI_QUAN_HE
        WHERE isSHCC = qhcb.SHCC;
    return cur;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION SACH_GIAO_TRINH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM SACH_GIAO_TRINH
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM SACH_GIAO_TRINH ORDER BY SHCC DESC) GROUP BY SHCC)) sgt
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(sgt.TEN) LIKE sT
       OR LOWER(sgt.SAN_PHAM) LIKE sT
       OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
       OR LOWER(TO_CHAR(sgt.NAM_SAN_XUAT)) LIKE sT
       OR LOWER(sgt.BUT_DANH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT sgt.ID           AS                "id",
                        sgt.TEN AS "ten",
                        sgt.THE_LOAI AS "theLoai",
                        sgt.NHA_SAN_XUAT AS "nhaSanXuat",
                        sgt.NAM_SAN_XUAT    AS "namSanXuat",
                        sgt.SAN_PHAM    AS "sanPham",
                        sgt.CHU_BIEN    AS "chuBien",
                        sgt.BUT_DANH    AS "butDanh",
                        sgt.QUOC_TE AS "quocTe",
                        sgt.SHCC            AS                "shcc",
                        (SELECT COUNT(*)
                         FROM SACH_GIAO_TRINH sgt_temp
                         WHERE sgt_temp.SHCC = sgt.SHCC
                           AND (sgt_temp.NAM_SAN_XUAT IS NULL OR fromYear IS NULL OR
                                sgt_temp.NAM_SAN_XUAT >= fromYear)
                           AND (sgt_temp.NAM_SAN_XUAT IS NULL OR toYear IS NULL OR
                                sgt_temp.NAM_SAN_XUAT <= toYear)
                        ) AS "soLuong",

                        (Select listagg(sgt_temp2.TEN || ' ', '??') within group ( order by null)
                         FROM SACH_GIAO_TRINH sgt_temp2
                         WHERE sgt_temp2.SHCC = sgt.SHCC
                           AND (sgt_temp2.NAM_SAN_XUAT IS NULL OR fromYear IS NULL OR
                                sgt_temp2.NAM_SAN_XUAT >= fromYear)
                           AND (sgt_temp2.NAM_SAN_XUAT IS NULL OR toYear IS NULL OR
                                sgt_temp2.NAM_SAN_XUAT <= toYear)
                        ) AS "danhSach",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
                FROM (SELECT *
                      FROM SACH_GIAO_TRINH
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM SACH_GIAO_TRINH ORDER BY SHCC DESC) GROUP BY SHCC)) sgt
                         LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(sgt.TEN) LIKE sT
                   OR LOWER(sgt.SAN_PHAM) LIKE sT
                   OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
                   OR LOWER(TO_CHAR(sgt.NAM_SAN_XUAT)) LIKE sT
                   OR LOWER(sgt.BUT_DANH) LIKE sT)
                ORDER BY sgt.NAM_SAN_XUAT DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION SACH_GIAO_TRINH_GROUP_PAGE_MA(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                               searchTerm IN STRING,
                                               totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM SACH_GIAO_TRINH sgt
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0) AND (sgt.SHCC = searchTerm);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT sgt.ID           AS                "id",
                        sgt.TEN AS "ten",
                        sgt.THE_LOAI AS "theLoai",
                        sgt.NHA_SAN_XUAT AS "nhaSanXuat",
                        sgt.NAM_SAN_XUAT    AS "namSanXuat",
                        sgt.SAN_PHAM    AS "sanPham",
                        sgt.CHU_BIEN    AS "chuBien",
                        sgt.BUT_DANH    AS "butDanh",
                        sgt.QUOC_TE AS "quocTe",
                        sgt.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                FROM SACH_GIAO_TRINH sgt
                         LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (loaiDoiTuong = '-1' OR INSTR(loaiDoiTuong, dv.MA) != 0) AND (sgt.SHCC = searchTerm)
                ORDER BY sgt.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION SACH_GIAO_TRINH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM SACH_GIAO_TRINH sgt
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT IS NULL OR sgt.NAM_SAN_XUAT >= fromYear)
      AND (toYear IS NULL OR sgt.NAM_SAN_XUAT IS NULL OR sgt.NAM_SAN_XUAT <= toYear)
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(sgt.TEN) LIKE sT
       OR LOWER(sgt.SAN_PHAM) LIKE sT
       OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
       OR LOWER(TO_CHAR(sgt.NAM_SAN_XUAT)) LIKE sT
       OR LOWER(sgt.BUT_DANH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT sgt.ID           AS                "id",
                        sgt.TEN AS "ten",
                        sgt.THE_LOAI AS "theLoai",
                        sgt.NHA_SAN_XUAT AS "nhaSanXuat",
                        sgt.NAM_SAN_XUAT    AS "namSanXuat",
                        sgt.SAN_PHAM    AS "sanPham",
                        sgt.CHU_BIEN    AS "chuBien",
                        sgt.BUT_DANH    AS "butDanh",
                        sgt.QUOC_TE AS "quocTe",
                        sgt.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
                FROM SACH_GIAO_TRINH sgt
                         LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT IS NULL OR sgt.NAM_SAN_XUAT >= fromYear)
                  AND (toYear IS NULL OR sgt.NAM_SAN_XUAT IS NULL OR sgt.NAM_SAN_XUAT <= toYear)
                  AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(sgt.TEN) LIKE sT
                   OR LOWER(sgt.SAN_PHAM) LIKE sT
                   OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
                   OR LOWER(TO_CHAR(sgt.NAM_SAN_XUAT)) LIKE sT
                   OR LOWER(sgt.BUT_DANH) LIKE sT)
                ORDER BY sgt.NAM_SAN_XUAT DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE PROCEDURE sub_menu_swap_priority (p_ma in NUMBER, p_thu_tu in number, p_is_up in number)
IS
BEGIN
    IF p_is_up=1 THEN
        UPDATE FW_SUBMENU SET PRIORITY=PRIORITY+1 WHERE PRIORITY >= p_thu_tu;
    ELSE
        UPDATE FW_SUBMENU SET PRIORITY=PRIORITY-1 WHERE PRIORITY <= p_thu_tu;
    END IF;
    UPDATE FW_SUBMENU SET PRIORITY=p_thu_tu WHERE ID=p_ma;
    commit;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION TRINH_DO_NGOAI_NGU_BY_SHCC(isSHCC in STRING) RETURN SYS_REFCURSOR
AS
    cur SYS_REFCURSOR;
BEGIN
    OPEN cur FOR
        SELECT
               tdnn.ID AS "id",
               tdnn.SHCC AS "shcc",
               tdnn.LOAI_NGON_NGU AS "loaiNgonNgu",
               dmnn.TEN AS "tenLoaiNgonNgu",
               tdnn.TRINH_DO AS "trinhDo"
        FROM TRINH_DO_NGOAI_NGU tdnn
                 LEFT JOIN DM_NGOAI_NGU dmnn ON dmnn.MA = tdnn.LOAI_NGON_NGU
        WHERE isSHCC = tdnn.SHCC;
    return cur;
END;
/
--EndMethod--

