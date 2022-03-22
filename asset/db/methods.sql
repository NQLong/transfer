CREATE OR REPLACE FUNCTION COMPARE_STRING_FILTER(INPUT IN STRING) RETURN VARCHAR2
    IS OUTPUT VARCHAR2(500);
BEGIN
    SELECT regexp_substr(INPUT, '[^,]+', 1, level) INTO OUTPUT
                                      from dual
                                      connect by regexp_substr(INPUT, '[^,]+', 1, level) is not null;
    RETURN OUTPUT;
end;
/
--EndMethod--

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
               CBK.PHAI              AS "gioiTinh",
               QG1.TEN_QUOC_GIA      AS "quocTichKy",
               (CASE
                    WHEN CBK.PHAI IS NOT NULL THEN
                        CASE
                            WHEN CBK.PHAI LIKE '01' THEN 'Ông'
                            ELSE 'Bà'
                            END
                    ELSE ''
                   END)              AS "phaiNK",
               CBK.MA_CHUC_VU        AS "maChucVuNguoiKy",
               DMCV.TEN              AS "chucVuNguoiKy",
               DVK.TEN               AS "donViNguoiKy",
               HD.NGUOI_DUOC_THUE    AS "shcc",
               (CASE
                    WHEN CB.PHAI IS NOT NULL THEN
                        CASE
                            WHEN CB.PHAI = '01' THEN 'Ông'
                            ELSE 'Bà'
                            END
                    ELSE ''
                   END)              AS "phai",
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
                 LEFT JOIN DM_QUOC_GIA QG1 ON CB.QUOC_GIA = QG1.MA_CODE
                 LEFT JOIN DM_QUOC_GIA QT ON CB.QUOC_GIA = QT.MA_CODE
                 LEFT JOIN DM_NGACH_CDNN NG ON HD.NGACH = NG.ID
                 LEFT JOIN DM_TRINH_DO TDHV ON CB.HOC_VI = TDHV.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP1 ON CB.MA_TINH_NOI_SINH = TP1.MA
                 LEFT JOIN DM_TINH_THANH_PHO TP2 ON CB.MA_TINH_NGUYEN_QUAN = TP2.MA
                 LEFT JOIN TCHC_CAN_BO CBK ON HD.NGUOI_KY = CBK.SHCC
                 LEFT JOIN QT_CHUC_VU CV ON CBK.SHCC = CV.SHCC AND CV.CHUC_VU_CHINH = 1
                 LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = CV.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI DVK ON CBK.MA_DON_VI = DVK.MA
                 LEFT JOIN DM_DON_VI DV3 ON HD.DIA_DIEM_LAM_VIEC = DV3.MA
                 LEFT JOIN DM_TRINH_DO CDKH ON CB.HOC_VI = CDKH.MA
                 LEFT JOIN DM_NGACH_CDNN CDCM ON HD.CHUC_DANH_CHUYEN_MON = CDCM.MA
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

CREATE OR REPLACE FUNCTION FW_STUDENT_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       listFaculty IN STRING, listFromCity IN STRING, listEthnic IN STRING,
                                       listNationality IN STRING, listReligion IN STRING, listLoaiHinhDaoTao IN STRING,
                                       listLoaiSinhVien IN STRING, listTinhTrangSinhVien IN STRING,
                                       gender IN STRING, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    STUDENT_INFO SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';

BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM FW_STUDENT STU
             LEFT JOIN DM_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
             LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
             LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
             LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
             LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
             LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
             LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
             LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
             LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
    WHERE ((listFaculty IS NULL AND listFromCity IS NULL AND listEthnic IS NULL AND
            listNationality IS NULL AND
            listReligion IS NULL AND
            listLoaiHinhDaoTao IS NULL AND
            listLoaiSinhVien IS NULL AND listTinhTrangSinhVien IS NULL AND gender IS NULL)
        OR (STU.KHOA IN (select regexp_substr(listFaculty, '[^,]+', 1, level)
                         from dual
                         connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null))
--         OR (listFaculty IS NOT NULL AND INSTR(TO_CHAR(listFaculty), TO_CHAR(STU.KHOA)) != 0)
        OR (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender)
        OR (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0)
        OR (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0)
        OR (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_GIA) != 0)
        OR (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0)
        OR (listLoaiHinhDaoTao IS NOT NULL AND INSTR(listLoaiHinhDaoTao, STU.LOAI_HINH_DAO_TAO) != 0)
        OR (listLoaiSinhVien IS NOT NULL AND INSTR(listLoaiSinhVien, STU.LOAI_SINH_VIEN) != 0)
        OR (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0))
      AND (searchTerm = ''
        OR LOWER(STU.MSSV) LIKE sT
        OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
        OR LOWER(STU.MA_NGANH) LIKE sT
        OR LOWER(STU.LOP) LIKE sT
        OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE sT
        OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE sT
        OR LOWER(STU.EMAIL_CA_NHAN) LIKE sT);


    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN STUDENT_INFO FOR
        SELECT *
        FROM (
                 SELECT STU.MSSV           AS                "mssv",
                        STU.HO             AS                "ho",
                        STU.TEN            AS                "ten",
                        STU.EMAIL_CA_NHAN  AS                "emailCaNhan",
                        STU.EMAIL_TRUONG   AS                "emailTruong",
                        STU.NGAY_SINH      AS                "ngaySinh",
                        STU.GIOI_TINH      AS                "gioiTinh",
                        DANTOC.TEN         AS                "danToc",
                        STU.DAN_TOC        AS                "maDanToc",
                        STU.QUOC_GIA       AS                "maQuocGia",
                        LSV.TEN            AS                "loaiSinhVien",
                        LHDT.TEN           AS                "loaiHinhDaoTao",
                        TTSV.TEN           AS                "tinhTrangSinhVien",
                        STU.KHOA           AS                "khoa",
                        KHOA.TEN           AS                "tenKhoa",
                        STU.MA_NGANH       AS                "maNganh",
                        STU.LOP            AS                "lop",
                        STU.NAM_TUYEN_SINH AS                "namTuyenSinh",
                        STU.NGAY_NHAP_HOC  AS                "ngayNhapHoc",
                        ROW_NUMBER() OVER (ORDER BY STU.TEN) R
                 FROM FW_STUDENT STU
                          LEFT JOIN DM_LOAI_HINH_DAO_TAO LHDT ON LHDT.MA = STU.LOAI_HINH_DAO_TAO
                          LEFT JOIN DM_LOAI_SINH_VIEN LSV on LSV.MA = STU.LOAI_SINH_VIEN
                          LEFT JOIN DM_GIOI_TINH GT ON GT.MA = STU.GIOI_TINH
                          LEFT JOIN DM_QUOC_GIA QG ON QG.MA_CODE = STU.QUOC_GIA
                          LEFT JOIN DM_DAN_TOC DANTOC ON DANTOC.MA = STU.DAN_TOC
                          LEFT JOIN DM_TON_GIAO TONGIAO ON TONGIAO.MA = STU.TON_GIAO
                          LEFT JOIN DM_TINH_THANH_PHO TINHTHANH ON TINHTHANH.MA = STU.THUONG_TRU_MA_TINH
                          LEFT JOIN DM_DON_VI KHOA ON KHOA.MA = STU.KHOA
                          LEFT JOIN DM_TINH_TRANG_SINH_VIEN TTSV ON TTSV.MA = STU.TINH_TRANG
                 WHERE ((listFaculty IS NULL AND listFromCity IS NULL AND listEthnic IS NULL AND
                         listNationality IS NULL AND
                         listReligion IS NULL AND
                         listLoaiHinhDaoTao IS NULL AND
                         listLoaiSinhVien IS NULL AND listTinhTrangSinhVien IS NULL AND gender IS NULL)
                     OR (STU.KHOA IN (select regexp_substr(listFaculty, '[^,]+', 1, level)
                                      from dual
                                      connect by regexp_substr(listFaculty, '[^,]+', 1, level) is not null))
--                       OR (listFaculty IS NOT NULL AND INSTR(TO_CHAR(listFaculty), TO_CHAR(STU.KHOA)) != 0)
                     OR (gender IS NOT NULL AND ('0' + STU.GIOI_TINH) = gender)
                     OR (listFromCity IS NOT NULL AND INSTR(listFromCity, STU.THUONG_TRU_MA_TINH) != 0)
                     OR (listEthnic IS NOT NULL AND INSTR(listEthnic, STU.DAN_TOC) != 0)
                     OR (listNationality IS NOT NULL AND INSTR(listNationality, STU.QUOC_GIA) != 0)
                     OR (listReligion IS NOT NULL AND INSTR(listReligion, STU.DAN_TOC) != 0)
                     OR (listLoaiHinhDaoTao IS NOT NULL AND INSTR(listLoaiHinhDaoTao, STU.LOAI_HINH_DAO_TAO) != 0)
                     OR (listLoaiSinhVien IS NOT NULL AND INSTR(listLoaiSinhVien, STU.LOAI_SINH_VIEN) != 0)
                     OR (listTinhTrangSinhVien IS NOT NULL AND INSTR(listTinhTrangSinhVien, STU.TINH_TRANG) != 0))
                   AND (searchTerm = ''
                     OR LOWER(STU.MSSV) LIKE sT
                     OR LOWER(TRIM(STU.HO || ' ' || STU.TEN)) LIKE sT
                     OR LOWER(STU.MA_NGANH) LIKE sT
                     OR LOWER(STU.LOP) LIKE sT
                     OR LOWER(STU.DIEN_THOAI_CA_NHAN) LIKE sT
                     OR LOWER(STU.DIEN_THOAI_LIEN_LAC) LIKE sT
                     OR LOWER(STU.EMAIL_CA_NHAN) LIKE sT)
                 ORDER BY STU.NAM_TUYEN_SINH NULLS LAST
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN STUDENT_INFO;
end;
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

CREATE OR REPLACE function GET_MA_DON_VI_MAX RETURN NUMBER
IS
    max_ma NUMBER;
BEGIN
    Select max(MA) into max_ma from DM_DON_VI;
    return max_ma;
end;
/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DEN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        donViGuiCV IN STRING, donVi in STRING, maCanBo IN STRING, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DEN hcthcvd
             LEFT JOIN DM_DON_VI_GUI_CV dvgcv on (hcthcvd.DON_VI_GUI = dvgcv.ID)
    WHERE
        (donViGuiCV IS NULL OR hcthcvd.DON_VI_GUI = donViGuiCV)
        AND (
            searchTerm = ''
            OR LOWER(hcthcvd.NOI_DUNG) LIKE sT
            OR LOWER(hcthcvd.CHI_DAO) LIKE sT
        )
    ;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                    hcthcvd.ID              AS                  "id",
                    hcthcvd.NGAY_NHAN       AS                  "ngayNhan",
                    hcthcvd.CHI_DAO         AS                  "chiDao",
                    hcthcvd.NOI_DUNG        AS                  "noiDung",
                    hcthcvd.NGAY_CONG_VAN   AS                  "ngayCongVan",
                    hcthcvd.NGAY_HET_HAN    AS                  "ngayHetHan",
                    hcthcvd.SO_CONG_VAN     AS                  "soCongVan",
                    hcthcvd.DON_VI_NHAN     AS                  "maDonViNhan",
                    hcthcvd.CAN_BO_NHAN     AS                  "maCanBoNhan",


                    dvgcv.ID                AS                  "maDonViGuiCV",
                    dvgcv.TEN               AS                  "tenDonViGuiCV",

                    (SELECT LISTAGG(dvn.TEN, '; ') WITHIN GROUP (order by dvn.TEN)
                         FROM DM_DON_VI dvn
                         WHERE INSTR(hcthcvd.DON_VI_NHAN, dvn.MA) != 0
                    ) AS "danhSachDonViNhan",

                    (
                        SELECT
                            LISTAGG(CASE
                                WHEN cbn.HO IS NULL THEN cbn.TEN
                                WHEN cbn.TEN IS NULL THEN cbn.HO
                                ELSE CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                            END, '; ') WITHIN GROUP (order by cbn.TEN) as hoVaTenCanBo
                        FROM TCHC_CAN_BO cbn
                        WHERE INSTR(hcthcvd.CAN_BO_NHAN, cbn.shcc) != 0
                    ) AS "danhSachCanBoNhan",

                    ROW_NUMBER() OVER (ORDER BY hcthcvd.NGAY_CONG_VAN DESC) R
                 FROM HCTH_CONG_VAN_DEN hcthcvd
                     LEFT JOIN DM_DON_VI_GUI_CV dvgcv on (hcthcvd.DON_VI_GUI = dvgcv.ID)
                WHERE
                    (donVi IS NULL OR ((INSTR(donVi, ',') != 0 AND INSTR(donVi, hcthcvd.DON_VI_NHAN) != 0) OR (donVi = hcthcvd.DON_VI_NHAN)))

                    AND (
                        donViGuiCV IS NULL
                        OR (
                            (INSTR(donViGuiCV, ',') != 0 AND INSTR(donViGuiCV, hcthcvd.DON_VI_GUI) != 0)
                            --OR (donViGuiCV = hcthcvd.DON_VI_GUI)
                        )
                    )

                    AND (maCanBo IS NULL OR ((INSTR(maCanBo, ',') != 0 AND INSTR(maCanBo, hcthcvd.CAN_BO_NHAN) != 0) 
                                                 OR (maCanBo = hcthcvd.CAN_BO_NHAN)
                        ))
                    AND
                    (
                        searchTerm = ''
                        OR LOWER(hcthcvd.NOI_DUNG) LIKE sT
                        OR LOWER(hcthcvd.CHI_DAO) LIKE sT
                    )

                ORDER BY hcthcvd.NGAY_CONG_VAN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION HCTH_CONG_VAN_DI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                       maCanBo IN STRING, donViGui IN NUMBER, donVi IN NUMBER, searchTerm IN STRING,
                                       totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR

AS
    CVD_INFO SYS_REFCURSOR;
    ST           STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM HCTH_CONG_VAN_DI hcthCVD
        LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
    WHERE
        (donViGui IS NULL OR hcthCVD.DON_VI_GUI = donViGui )
--         AND (donVi IS NULL)
--         AND (maCanBo IS NULL)
        AND (
            searchTerm = ''
--             OR LOWER(dv.TEN) LIKE ST
            OR LOWER(hcthCVD.NOI_DUNG) LIKE ST
--             OR LOWER(cb.SHCC) LIKE ST
--             OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        )
    ;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN CVD_INFO FOR
        SELECT *
        FROM (
            SELECT
                hcthCVD.ID              AS      "id",
                hcthCVD.NOI_DUNG        AS      "noiDung",
                hcthCVD.NGAY_GUI        AS      "ngayGui",
                hcthCVD.NGAY_KY         AS      "ngayKy",
                hcthCVD.DON_VI_NHAN     AS      "maDonViNhan",
                hcthCVD.CAN_BO_NHAN     AS      "maCanBoNhan",
                hcthCVD.IS_DON_VI       AS      "isDonVi",
                hcthCVD.IS_CAN_BO       AS      "isCanBo",

                dvg.MA                   AS     "maDonViGui",
                dvg.TEN                  AS     "tenDonViGui",

                (SELECT LISTAGG(dvn.TEN, ' - ') WITHIN GROUP (order by dvn.TEN)
                     FROM DM_DON_VI dvn
                     WHERE INSTR(hcthCVD.DON_VI_NHAN, dvn.MA) != 0
                ) AS "danhSachDonViNhan",
                (SELECT
                    LISTAGG(CASE
                            WHEN cbn.HO IS NULL THEN cbn.TEN
                            WHEN cbn.TEN IS NULL THEN cbn.HO
                            ELSE CONCAT(CONCAT(cbn.HO, ' '), cbn.TEN)
                        END, ' - ') WITHIN GROUP (order by cbn.TEN) 
                    FROM TCHC_CAN_BO cbn
                    WHERE INSTR(hcthCVD.CAN_BO_NHAN, cbn.shcc) != 0
                ) AS "danhSachCanBoNhan",
                ROW_NUMBER() OVER (ORDER BY hcthcvd.NGAY_GUI DESC) R
            FROM HCTH_CONG_VAN_DI hcthCVD
                LEFT JOIN DM_DON_VI dvg on (hcthCVD.DON_VI_GUI = dvg.MA)
            WHERE (
                (donViGui IS NULL OR hcthCVD.DON_VI_GUI = donViGui)
                AND (
                    searchTerm = ''
                    OR LOWER(hcthCVD.NOI_DUNG) LIKE ST
                    OR LOWER(dvg.TEN) LIKE ST
                        )
                    )
                ORDER BY hcthCVD.NGAY_GUI DESC
                )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN CVD_INFO;
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

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_DOWNLOAD_EXCEL(
    list_shcc IN STRING, list_dv IN STRING,
    fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbvkh.ID           AS                         "id",
                        qtbvkh.TEN_TAC_GIA  AS                         "tenTacGia",
                        qtbvkh.NAM_XUAT_BAN AS                         "namXuatBan",
                        qtbvkh.TEN_BAI_VIET AS                         "tenBaiViet",
                        qtbvkh.TEN_TAP_CHI  AS                         "tenTapChi",
                        qtbvkh.SO_HIEU_ISSN AS                         "soHieuIssn",
                        qtbvkh.SAN_PHAM     AS                         "sanPham",
                        qtbvkh.DIEM_IF      AS                         "diemIf",
                        qtbvkh.QUOC_TE      AS                         "quocTe",
                        qtbvkh.SHCC         AS                         "shcc",

                        cb.HO               AS                         "hoCanBo",
                        cb.TEN              AS                         "tenCanBo",

                        dv.MA               AS                         "maDonVi",
                        dv.TEN              AS                         "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC) R
                 FROM QT_BAI_VIET_KHOA_HOC qtbvkh
                          LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbvkh.SHCC) != 0) OR
                            (list_shcc = qtbvkh.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
                         AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))))
                   AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))
                 ORDER BY qtbvkh.NAM_XUAT_BAN DESC
             );
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER, searchTerm IN STRING,
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
             LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbvkh.ID           AS                "id",
                        qtbvkh.SHCC AS "shcc",
                        (SELECT COUNT(*)
                        FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbvkh_temp.SHCC) != 0) OR (list_shcc = qtbvkh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                          AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))))
                          AND (xuatBanRange IS NULL OR (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                            OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                            OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                            OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)
                        ) AS "soBaiViet",

                        (select rtrim(xmlagg(xmlelement(e, qtbvkh_temp.TEN_BAI_VIET || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAI_VIET_KHOA_HOC qtbvkh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtbvkh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtbvkh_temp.SHCC = qtbvkh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbvkh_temp.SHCC) != 0) OR (list_shcc = qtbvkh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN >= fromYear))
                          AND (qtbvkh_temp.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh_temp.NAM_XUAT_BAN <= toYear))))
                          AND (xuatBanRange IS NULL OR (qtbvkh_temp.QUOC_TE IS NOT NULL AND qtbvkh_temp.QUOC_TE = xuatBanRange))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtbvkh_temp.TEN_TAC_GIA) LIKE sT
                            OR LOWER(qtbvkh_temp.TEN_BAI_VIET) LIKE sT
                            OR LOWER(qtbvkh_temp.SO_HIEU_ISSN) LIKE sT
                            OR LOWER(qtbvkh_temp.TEN_TAP_CHI) LIKE sT)
                        ) AS "danhSachBaiViet",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC) R
                FROM (SELECT *
                      FROM QT_BAI_VIET_KHOA_HOC
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAI_VIET_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtbvkh
                         LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                ORDER BY qtbvkh.NAM_XUAT_BAN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAI_VIET_KHOA_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, xuatBanRange IN NUMBER, searchTerm IN STRING,
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
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbvkh.SHCC) != 0) OR (list_shcc = qtbvkh.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
      AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))))
      AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
        OR LOWER(qtbvkh.TEN_BAI_VIET) LIKE sT
        OR LOWER(qtbvkh.SO_HIEU_ISSN) LIKE sT
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

                        ROW_NUMBER() OVER (ORDER BY NAM_XUAT_BAN DESC) R
                FROM QT_BAI_VIET_KHOA_HOC qtbvkh
                         LEFT JOIN TCHC_CAN_BO cb on qtbvkh.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbvkh.SHCC) != 0) OR (list_shcc = qtbvkh.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (fromYear IS NULL OR qtbvkh.NAM_XUAT_BAN >= fromYear))
                  AND (qtbvkh.NAM_XUAT_BAN IS NOT NULL AND (toYear IS NULL OR qtbvkh.NAM_XUAT_BAN <= toYear))))
                  AND (xuatBanRange IS NULL OR (qtbvkh.QUOC_TE IS NOT NULL AND qtbvkh.QUOC_TE = xuatBanRange))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtbvkh.TEN_TAC_GIA) LIKE sT
                    OR LOWER(qtbvkh.TEN_BAI_VIET) LIKE sT
                    OR LOWER(qtbvkh.SO_HIEU_ISSN) LIKE sT
                    OR LOWER(qtbvkh.TEN_TAP_CHI) LIKE sT)
                ORDER BY qtbvkh.NAM_XUAT_BAN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BANG_PHAT_MINH_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
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
          FROM QT_BANG_PHAT_MINH
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BANG_PHAT_MINH ORDER BY SHCC DESC) GROUP BY SHCC)) qtbpm
             LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC;
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbpm.ID           AS                "id",
                        qtbpm.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        (SELECT COUNT(*)
                        FROM QT_BANG_PHAT_MINH qtbpm_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtbpm_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtbpm_temp.SHCC = qtbpm.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbpm_temp.SHCC) != 0) OR (list_shcc = qtbpm_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND ((qtbpm_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm_temp.NAM_CAP >= fromYear)) AND (toYear IS NULL OR qtbpm_temp.NAM_CAP <= toYear)
                              ))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtbpm_temp.TEN_BANG) LIKE sT
                            OR LOWER(qtbpm_temp.SO_HIEU) LIKE sT
                            OR LOWER(qtbpm_temp.TAC_GIA) LIKE sT
                            OR LOWER(qtbpm_temp.SAN_PHAM) LIKE sT)
                        )) AS "soBang",

                        (select rtrim(xmlagg(xmlelement(e, qtbpm_temp.TEN_BANG|| ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BANG_PHAT_MINH qtbpm_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtbpm_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtbpm_temp.SHCC = qtbpm.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbpm_temp.SHCC) != 0) OR (list_shcc = qtbpm_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND ((qtbpm_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm_temp.NAM_CAP >= fromYear)) AND (toYear IS NULL OR qtbpm_temp.NAM_CAP <= toYear)
                              ))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtbpm_temp.TEN_BANG) LIKE sT
                            OR LOWER(qtbpm_temp.SO_HIEU) LIKE sT
                            OR LOWER(qtbpm_temp.TAC_GIA) LIKE sT
                            OR LOWER(qtbpm_temp.SAN_PHAM) LIKE sT)
                        )) AS "danhSachTenBang",

                        ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
                FROM (SELECT *
                      FROM QT_BANG_PHAT_MINH
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BANG_PHAT_MINH ORDER BY SHCC DESC) GROUP BY SHCC)) qtbpm
                         LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
                ORDER BY qtbpm.NAM_CAP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BANG_PHAT_MINH_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER,
                                          searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BANG_PHAT_MINH qtbpm
             LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbpm.SHCC) != 0) OR (list_shcc = qtbpm.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND ((qtbpm.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm.NAM_CAP >= fromYear)) AND
                        (toYear IS NULL OR qtbpm.NAM_CAP <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtbpm.TEN_BANG) LIKE sT
        OR LOWER(qtbpm.SO_HIEU) LIKE sT
        OR LOWER(qtbpm.TAC_GIA) LIKE sT
        OR LOWER(qtbpm.SAN_PHAM) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtbpm.ID               AS                  "id",
                        qtbpm.SHCC             AS                  "shcc",
                        qtbpm.TEN_BANG         AS                  "tenBang",
                        qtbpm.SO_HIEU          AS                  "soHieu",
                        qtbpm.NAM_CAP          AS                  "namCap",
                        qtbpm.NOI_CAP          AS                  "noiCap",
                        qtbpm.TAC_GIA          AS                  "tacGia",
                        qtbpm.SAN_PHAM         AS                  "sanPham",
                        qtbpm.LOAI_BANG        AS                  "loaiBang",

                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
                 FROM QT_BANG_PHAT_MINH qtbpm
                          LEFT JOIN TCHC_CAN_BO cb on qtbpm.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                        OR (((list_shcc IS NOT NULL AND
                              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtbpm.SHCC) != 0) OR (list_shcc = qtbpm.SHCC)))
                            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                            OR (list_shcc IS NULL AND list_dv IS NULL))
                            AND ((qtbpm.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtbpm.NAM_CAP >= fromYear)) AND
                                        (toYear IS NULL OR qtbpm.NAM_CAP <= toYear))))
                      AND (searchTerm = ''
                        OR LOWER(cb.SHCC) LIKE sT
                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                        OR LOWER(qtbpm.TEN_BANG) LIKE sT
                        OR LOWER(qtbpm.SO_HIEU) LIKE sT
                        OR LOWER(qtbpm.TAC_GIA) LIKE sT
                        OR LOWER(qtbpm.SAN_PHAM) LIKE sT)
                 ORDER BY qtbpm.NOI_CAP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
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

                        today as "today",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY bhxh.BAT_DAU DESC ) R
                 FROM QT_BAO_HIEM_XA_HOI bhxh
                          LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh.SHCC) != 0) OR (list_shcc = bhxh.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (
                        timeType = 1 AND (bhxh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh.BAT_DAU <= toYear)
                      ))
                  AND (tinhTrang IS NULL OR ((bhxh.KET_THUC = -1 OR bhxh.KET_THUC >= today) AND tinhTrang = 2) OR
                       (bhxh.KET_THUC IS NOT NULL AND bhxh.KET_THUC != -1 AND bhxh.KET_THUC < today AND tinhTrang = 1))))
                 ORDER BY bhxh.BAT_DAU DESC
             );
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_BAO_HIEM_XA_HOI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAO_HIEM_XA_HOI ORDER BY SHCC DESC) GROUP BY SHCC)) bhxh
              LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
              LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA;

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

                        (SELECT COUNT(*)
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, bhxh_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_BAO_HIEM_XA_HOI bhxh_temp
                                 LEFT JOIN TCHC_CAN_BO cb on bhxh_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv on bhxh_temp.CHUC_VU = cv.MA
                        WHERE (bhxh_temp.SHCC = bhxh.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh_temp.SHCC) != 0) OR (list_shcc = bhxh_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (bhxh_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((bhxh_temp.KET_THUC = -1 OR bhxh_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                               (bhxh_temp.KET_THUC IS NOT NULL AND bhxh_temp.KET_THUC != -1 AND bhxh_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT)
                        ) AS "danhSachBatDauType",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",
                        ROW_NUMBER() OVER (ORDER BY bhxh.BAT_DAU DESC ) R
                     FROM (SELECT *
                          FROM QT_BAO_HIEM_XA_HOI
                          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_BAO_HIEM_XA_HOI ORDER BY SHCC DESC) GROUP BY SHCC)) bhxh
                              LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                              LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                ORDER BY bhxh.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_BAO_HIEM_XA_HOI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_BAO_HIEM_XA_HOI bhxh
             LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh.SHCC) != 0) OR (list_shcc = bhxh.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (
            timeType = 1 AND (bhxh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh.BAT_DAU <= toYear)
          ))
      AND (tinhTrang IS NULL OR ((bhxh.KET_THUC = -1 OR bhxh.KET_THUC >= today) AND tinhTrang = 2) OR
           (bhxh.KET_THUC IS NOT NULL AND bhxh.KET_THUC != -1 AND bhxh.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(cv.TEN) LIKE sT);

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

                        today as "today",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        cv.MA               as  "maChucVu",
                        cv.TEN              as  "tenChucVu",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY bhxh.BAT_DAU DESC ) R
                 FROM QT_BAO_HIEM_XA_HOI bhxh
                          LEFT JOIN TCHC_CAN_BO cb on bhxh.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_CHUC_VU cv on bhxh.CHUC_VU = cv.MA
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, bhxh.SHCC) != 0) OR (list_shcc = bhxh.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (
                        timeType = 1 AND (bhxh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR bhxh.BAT_DAU >= fromYear)) AND (toYear IS NULL OR bhxh.BAT_DAU <= toYear)
                      ))
                  AND (tinhTrang IS NULL OR ((bhxh.KET_THUC = -1 OR bhxh.KET_THUC >= today) AND tinhTrang = 2) OR
                       (bhxh.KET_THUC IS NOT NULL AND bhxh.KET_THUC != -1 AND bhxh.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(cv.TEN) LIKE sT)
                 ORDER BY bhxh.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, list_cv IN STRING,
                                        gioiTinh IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcv.SHCC                    AS       "shcc",
                        qtcv.STT                     AS       "stt",
                        cb.HO                        AS       "ho",
                        cb.TEN                       AS       "ten",
                        cb.PHAI AS "gioiTinh",
                        cb.NGAY_SINH    AS "ngaySinh",
                        cb.NGACH                     AS       "ngach",
                        cb.HOC_VI                    AS       "hocVi",
                        dnc.TEN                      AS        "tenChucDanhNgheNghiep",
                        (SELECT (cv.TEN || ' ??' || dv.TEN || ' ??' || bm.TEN || ' ??' || (qtcv_temp.NGAY_RA_QD) || ' ??' || qtcv_temp.SO_QD || ' ??' || cv.PHU_CAP || ' ')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 1)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "itemChinh",
                        (SELECT COUNT(*)
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "soChucVuKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, cv.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachChucVuKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, qtcv.SO_QD || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachSoQdKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, qtcv.NGAY_RA_QD || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachNgayQdKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, cv.PHU_CAP || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachHeSoPhuCapKiemNhiem",
                        (select rtrim(xmlagg(xmlelement(e, dv.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND (qtcv_temp.CHUC_VU_CHINH = 0)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                        ) AS "danhSachDonViKiemNhiem",
                        dv.MA               AS       "maDonVi",
                        dv.TEN                       AS       "tenDonVi",
                        ROW_NUMBER() OVER (ORDER BY qtcv.MA_CHUC_VU ASC) R
                FROM (SELECT *
                   FROM QT_CHUC_VU
                   WHERE STT IN
                         (SELECT MAX(STT) FROM (SELECT * FROM QT_CHUC_VU ORDER BY SHCC ASC ) GROUP BY SHCC)) qtcv
                          LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv ON cb.MA_DON_VI = dv.MA
                          LEFT JOIN DM_CHUC_DANH_NGHE_NGHIEP dnc on cb.NGACH = dnc.MA
                 ORDER BY QTCV.MA_CHUC_VU ASC
             );
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
               qtcv.NGAY_RA_QD_THOI_CHUC_VU AS "ngayRaQdThoiChucVu",
             ROW_NUMBER() OVER (ORDER BY qtcv.CHUC_VU_CHINH DESC ) R

        FROM QT_CHUC_VU qtcv
                 LEFT JOIN TCHC_CAN_BO cb ON qtcv.SHCC = cb.SHCC
                 LEFT JOIN DM_CHUC_VU cv ON cv.MA = qtcv.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI dv ON dv.MA = qtcv.MA_DON_VI
                 LEFT JOIN DM_BO_MON bm ON qtcv.MA_BO_MON = bm.MA
        WHERE qtcv.SHCC = isSHCC
    ORDER BY CHUC_VU_CHINH DESC;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, list_cv IN STRING, 
                                        gioiTinh IN STRING, searchTerm IN STRING,
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
             LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC;

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

                        (SELECT COUNT(*)
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                            AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcv_temp.SO_QD) LIKE sT
                            OR LOWER(qtcv_temp.SO_QD_THOI_CHUC_VU) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT
                            OR LOWER(dv.TEN) LIKE sT)
                        ) AS "soChucVu",

                        (select rtrim(xmlagg(xmlelement(e, cv.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CHUC_VU qtcv_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcv_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_CHUC_VU cv ON qtcv_temp.MA_CHUC_VU = cv.MA
                                 LEFT JOIN DM_DON_VI dv ON qtcv_temp.MA_DON_VI = dv.MA
                                 LEFT JOIN DM_BO_MON bm ON qtcv_temp.MA_BO_MON = bm.MA
                        WHERE (qtcv_temp.SHCC = qtcv.SHCC)
                            AND ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtcv_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                          AND (timeType = 0 OR (timeType = 1 AND
                                (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              OR ((timeType = 2) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_THOI_CHUC_VU <= toYear))
                              OR ((timeType = 3) AND
                                  (fromYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv_temp.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv_temp.NGAY_RA_QD <= toYear))
                              )
                            AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv_temp.MA_CHUC_VU) != 0))
                            AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcv_temp.SO_QD) LIKE sT
                            OR LOWER(qtcv_temp.SO_QD_THOI_CHUC_VU) LIKE sT
                            OR LOWER(cv.TEN) LIKE sT
                            OR LOWER(dv.TEN) LIKE sT)
                        ) AS "danhSachChucVu",

                        ROW_NUMBER() OVER (ORDER BY qtcv.NGAY_RA_QD_THOI_CHUC_VU DESC ) R
                 FROM (SELECT *
                       FROM QT_CHUC_VU
                       WHERE STT IN
                             (SELECT MAX(STT) FROM (SELECT * FROM QT_CHUC_VU ORDER BY MA_CHUC_VU ASC) GROUP BY SHCC)) qtcv
                          LEFT JOIN TCHC_CAN_BO cb on qtcv.SHCC = cb.SHCC
                 ORDER BY qtcv.STT DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CHUC_VU_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, list_cv IN STRING,
                                        gioiTinh IN STRING, searchTerm IN STRING,
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
      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
      AND (timeType = 0 OR (timeType = 1 AND
            (fromYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD <= toYear))
          OR ((timeType = 2) AND
              (fromYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU <= toYear))
          OR ((timeType = 3) AND
              (fromYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD <= toYear))
          )
        AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv.MA_CHUC_VU) != 0))
        AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtcv.SO_QD) LIKE sT
        OR LOWER(qtcv.SO_QD_THOI_CHUC_VU) LIKE sT
        OR LOWER(cv.TEN) LIKE sT
        OR LOWER(dv.TEN) LIKE sT);

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
                      AND (gioiTinh IS NULL OR (cb.PHAI = gioiTinh))
                      AND (timeType = 0 OR (timeType = 1 AND
                            (fromYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD IS NULL OR qtcv.NGAY_RA_QD <= toYear))
                          OR ((timeType = 2) AND
                              (fromYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_THOI_CHUC_VU IS NULL OR qtcv.NGAY_THOI_CHUC_VU <= toYear))
                          OR ((timeType = 3) AND
                              (fromYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU >= fromYear) AND (toYear IS NULL OR qtcv.NGAY_RA_QD_THOI_CHUC_VU IS NULL OR qtcv.NGAY_RA_QD <= toYear))
                          )
                        AND (list_cv IS NULL OR (list_cv IS NOT NULL AND INSTR(list_cv, qtcv.MA_CHUC_VU) != 0))
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

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, mucDich IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcttn.ID               AS                  "id",
                        qtcttn.LY_DO         AS                  "lyDo",
                        qtcttn.NOI_DEN         AS                  "noiDen",
                        qtcttn.SHCC             AS                  "shcc",
                        qtcttn.VIET_TAT  AS "vietTat",
                        qtcttn.BAT_DAU   AS "batDau",
                        qtcttn.BAT_DAU_TYPE  AS "batDauType",
                        qtcttn.KET_THUC   AS "ketThuc",
                        qtcttn.KET_THUC_TYPE  AS "ketThucType",
                        qtcttn.KINH_PHI   AS "kinhPhi",
                        qtcttn.GHI_CHU   AS "ghiChu",
                        qtcttn.SO_CV AS "soCv",
                        qtcttn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",

                        (select rtrim(xmlagg(xmlelement(e, dmttp.TEN, ', ').extract('//text()') order by null).getclobval(), ', ')
                         FROM DM_TINH_THANH_PHO dmttp
                         WHERE INSTR(qtcttn.NOI_DEN, dmttp.MA) != 0
                        ) AS "danhSachTinh",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",
                        dmtd.TEN              AS                  "tenHocVi",
                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDTN.MO_TA           AS    "tenMucDich",
                        dmcv.TEN    AS "tenChucVu",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM QT_CONG_TAC_TRONG_NUOC qtcttn
                         LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
                         LEFT JOIN DM_TRINH_DO dmtd ON cb.HOC_VI = dmtd.MA
                         LEFT JOIN DM_CHUC_VU dmcv ON dmcv.MA = cb.MA_CHUC_VU
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                    OR (((list_shcc IS NOT NULL AND
                          ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn.SHCC) != 0) OR (list_shcc = qtcttn.SHCC)))
                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                        OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qtcttn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                                    (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                            ) OR (
                                timeType = 2
                                AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                                AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qtcttn.KET_THUC = -1 OR qtcttn.KET_THUC >= today) AND tinhTrang = 2) OR
                             (qtcttn.KET_THUC IS NOT NULL AND qtcttn.KET_THUC != -1 AND qtcttn.KET_THUC < today AND tinhTrang = 1))))
                 ORDER BY qtcttn.BAT_DAU DESC
             );
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_CONG_TAC_TRONG_NUOC
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_CONG_TAC_TRONG_NUOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtcttn
             LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcttn.ID               AS                  "id",
                        qtcttn.SHCC             AS                  "shcc",

                        (SELECT COUNT(*)
                        FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                        WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn_temp.SHCC) != 0) OR (list_shcc = qtcttn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtcttn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtcttn_temp.KET_THUC = -1 OR qtcttn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qtcttn_temp.KET_THUC IS NOT NULL AND qtcttn_temp.KET_THUC != -1 AND qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                            OR LOWER(DMDTN.MO_TA) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                        WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn_temp.SHCC) != 0) OR (list_shcc = qtcttn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtcttn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtcttn_temp.KET_THUC = -1 OR qtcttn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qtcttn_temp.KET_THUC IS NOT NULL AND qtcttn_temp.KET_THUC != -1 AND qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                            OR LOWER(DMDTN.MO_TA) LIKE sT)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                        WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn_temp.SHCC) != 0) OR (list_shcc = qtcttn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtcttn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtcttn_temp.KET_THUC = -1 OR qtcttn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qtcttn_temp.KET_THUC IS NOT NULL AND qtcttn_temp.KET_THUC != -1 AND qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                            OR LOWER(DMDTN.MO_TA) LIKE sT)
                        ) AS "danhSachBatDauType",

                        (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                        WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn_temp.SHCC) != 0) OR (list_shcc = qtcttn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtcttn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtcttn_temp.KET_THUC = -1 OR qtcttn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qtcttn_temp.KET_THUC IS NOT NULL AND qtcttn_temp.KET_THUC != -1 AND qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                            OR LOWER(DMDTN.MO_TA) LIKE sT)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qtcttn_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                        WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn_temp.SHCC) != 0) OR (list_shcc = qtcttn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtcttn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtcttn_temp.KET_THUC = -1 OR qtcttn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qtcttn_temp.KET_THUC IS NOT NULL AND qtcttn_temp.KET_THUC != -1 AND qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                            OR LOWER(DMDTN.MO_TA) LIKE sT)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, DMDTN.MO_TA || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_CONG_TAC_TRONG_NUOC qtcttn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtcttn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn_temp.VIET_TAT = DMDTN.MA
                        WHERE (qtcttn_temp.SHCC = qtcttn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn_temp.SHCC) != 0) OR (list_shcc = qtcttn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtcttn_temp.VIET_TAT) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtcttn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qtcttn_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtcttn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtcttn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtcttn_temp.KET_THUC = -1 OR qtcttn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qtcttn_temp.KET_THUC IS NOT NULL AND qtcttn_temp.KET_THUC != -1 AND qtcttn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtcttn_temp.LY_DO) LIKE sT
                            OR LOWER(DMDTN.MO_TA) LIKE sT)
                        ) AS "danhSachMucDich",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM (SELECT *
                      FROM QT_CONG_TAC_TRONG_NUOC
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_CONG_TAC_TRONG_NUOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtcttn
                         LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 ORDER BY qtcttn.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_CONG_TAC_TRONG_NUOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_CONG_TAC_TRONG_NUOC qtcttn
             LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn.SHCC) != 0) OR (list_shcc = qtcttn.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
            AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
            AND (timeType = 0 OR (
                        timeType = 1 AND
                        (qtcttn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                ) OR (
                    timeType = 2
                    AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                    AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((qtcttn.KET_THUC = -1 OR qtcttn.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qtcttn.KET_THUC IS NOT NULL AND qtcttn.KET_THUC != -1 AND qtcttn.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtcttn.LY_DO) LIKE sT
        OR LOWER(DMDTN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtcttn.ID               AS                  "id",
                        qtcttn.LY_DO         AS                  "lyDo",
                        qtcttn.NOI_DEN         AS                  "noiDen",
                        qtcttn.SHCC             AS                  "shcc",
                        qtcttn.VIET_TAT  AS "vietTat",
                        qtcttn.BAT_DAU   AS "batDau",
                        qtcttn.BAT_DAU_TYPE  AS "batDauType",
                        qtcttn.KET_THUC   AS "ketThuc",
                        qtcttn.KET_THUC_TYPE  AS "ketThucType",
                        qtcttn.KINH_PHI   AS "kinhPhi",
                        qtcttn.GHI_CHU   AS "ghiChu",
                        qtcttn.SO_CV AS "soCv",
                        qtcttn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",

                        (select rtrim(xmlagg(xmlelement(e, dmttp.TEN, ', ').extract('//text()') order by null).getclobval(), ', ')
                         FROM DM_TINH_THANH_PHO dmttp
                         WHERE INSTR(qtcttn.NOI_DEN, dmttp.MA) != 0
                        ) AS "danhSachTinh",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDTN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM QT_CONG_TAC_TRONG_NUOC qtcttn
                         LEFT JOIN TCHC_CAN_BO cb on qtcttn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_TRONG_NUOC DMDTN on qtcttn.VIET_TAT = DMDTN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                    OR (((list_shcc IS NOT NULL AND
                          ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtcttn.SHCC) != 0) OR (list_shcc = qtcttn.SHCC)))
                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                        OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (mucDich IS NULL OR INSTR(mucDich, qtcttn.VIET_TAT) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qtcttn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtcttn.BAT_DAU >= fromYear)) AND
                                    (toYear IS NULL OR qtcttn.BAT_DAU <= toYear)
                            ) OR (
                                timeType = 2
                                AND (qtcttn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtcttn.NGAY_QUYET_DINH >= fromYear))
                                AND (toYear IS NULL OR qtcttn.NGAY_QUYET_DINH <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qtcttn.KET_THUC = -1 OR qtcttn.KET_THUC >= today) AND tinhTrang = 2) OR
                             (qtcttn.KET_THUC IS NOT NULL AND qtcttn.KET_THUC != -1 AND qtcttn.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtcttn.LY_DO) LIKE sT
                    OR LOWER(DMDTN.MO_TA) LIKE sT)
                 ORDER BY qtcttn.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DAO_TAO_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                       fromYear IN NUMBER, toYear IN NUMBER, list_loaiBang IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdt.ID                    as             "id",
                        qtdt.SHCC                  as             "shcc",
                        qtdt.TEN_TRUONG            as             "tenCoSoDaoTao",
                        qtdt.CHUYEN_NGANH          as             "chuyenNganh",
                        qtdt.BAT_DAU               as             "batDau",
                        qtdt.BAT_DAU_TYPE          as             "batDauType",
                        qtdt.KET_THUC              as             "ketThuc",
                        qtdt.KET_THUC_TYPE         as             "ketThucType",
                        qtdt.HINH_THUC             as             "hinhThuc",
                        qtdt.LOAI_BANG_CAP         as             "loaiBangCap",
                        qtdt.GHI_CHU_HINH_THUC     as             "ghiChuHinhThuc",
                        qtdt.GHI_CHU_LOAI_BANG_CAP as             "ghiChuLoaiBangCap",
                        qtdt.TRINH_DO              as             "trinhDo",
                        qtdt.KINH_PHI              as             "kinhPhi",

                        cb.TEN                     as             "tenCanBo",
                        cb.HO                      as             "hoCanBo",
                        cb.PHAI                    as             "gioiTinhCanBo",
                        cb.NGAY_SINH               as             "ngaySinhCanBo",
                        dv.MA                      AS             "maDonVi",
                        dv.TEN                     AS             "tenDonVi",
                        bdt.TEN                    as             "tenLoaiBangCap",
                        htdt.TEN                   as             "tenHinhThuc",
                        TDDT.TEN                   AS             "tenTrinhDo"
                 FROM QT_DAO_TAO qtdt
                          LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                          LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                          LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                            (list_loaiBang IS NULL))
                        OR (((list_shcc IS NOT NULL AND
                              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdt.SHCC) != 0) OR (list_shcc = qtdt.SHCC)))
                            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                            OR (list_loaiBang IS NOT NULL AND INSTR(list_loaiBang, qtdt.LOAI_BANG_CAP) != 0)
                            OR (list_shcc IS NULL AND list_dv IS NULL AND list_loaiBang IS NULL))
                            AND (qtdt.BAT_DAU IS NULL OR (qtdt.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtdt.BAT_DAU >= fromYear)))
                            AND (qtdt.KET_THUC IS NULL OR (qtdt.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtdt.KET_THUC <= (toYear + 86399999))))))
                 ORDER BY qtdt.BAT_DAU DESC NULLS LAST, cb.TEN DESC
             );
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

CREATE OR REPLACE function QT_DAO_TAO_GET_CURRENT_OF_STAFF(iSHCC in string, iTime in NUMBER) RETURN SYS_REFCURSOR
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
                  WHERE QT_DAO_TAO.SHCC = iSHCC
                      AND ((KET_THUC = -1)
                     OR (BAT_DAU IS NOT NULL AND KET_THUC IS NOT NULL AND BAT_DAU <= iTime AND KET_THUC >= iTime))
                 ) DT
            LEFT JOIN TCHC_CAN_BO CB ON DT.SHCC = CB.SHCC
                 LEFT JOIN DM_BANG_DAO_TAO LBC ON TO_CHAR(DT.LOAI_BANG_CAP) = TO_CHAR(LBC.MA)
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TO_CHAR(TDDT.MA) = DT.TRINH_DO
                 LEFT JOIN DM_HINH_THUC_DAO_TAO HTDT ON TO_CHAR(DT.HINH_THUC) = TO_CHAR(HTDT.MA)
            WHERE DT.SHCC = iSHCC;
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
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
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
                         where qtdt_temp2.SHCC = qtdt.SHCC
                            AND (qtdt_temp2.BAT_DAU IS NULL OR fromYear IS NULL OR
                                qtdt_temp2.BAT_DAU >= fromYear)
                           AND (qtdt_temp2.KET_THUC IS NULL OR toYear IS NULL OR
                                qtdt_temp2.KET_THUC <= toYear)
                            ) AS "danhSachChuyenNganh",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",
                        bdt.TEN             as  "tenBDT",
                        htdt.TEN            as  "tenHTDT",
                        
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY qtdt.BAT_DAU ASC) R
                FROM (SELECT *
                        FROM QT_DAO_TAO
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_DAO_TAO ORDER BY SHCC DESC ) GROUP BY SHCC)) qtdt
                         LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                         LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
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
                                       fromYear IN NUMBER, toYear IN NUMBER, list_loaiBang IN STRING,
                                       searchTerm IN STRING,
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
             LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
             LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
             LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (list_loaiBang IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdt.SHCC) != 0) OR (list_shcc = qtdt.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_loaiBang IS NOT NULL AND INSTR(list_loaiBang, qtdt.LOAI_BANG_CAP) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL AND list_loaiBang IS NULL))
            AND (qtdt.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtdt.BAT_DAU >= fromYear))
            AND (qtdt.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtdt.KET_THUC <= (toYear + 86399999)))))
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
                 SELECT qtdt.ID                    as             "id",
                        qtdt.SHCC                  as             "shcc",
                        qtdt.TEN_TRUONG            as             "tenCoSoDaoTao",
                        qtdt.CHUYEN_NGANH          as             "chuyenNganh",
                        qtdt.BAT_DAU               as             "batDau",
                        qtdt.BAT_DAU_TYPE          as             "batDauType",
                        qtdt.KET_THUC              as             "ketThuc",
                        qtdt.KET_THUC_TYPE         as             "ketThucType",
                        qtdt.HINH_THUC             as             "hinhThuc",
                        qtdt.LOAI_BANG_CAP         as             "loaiBangCap",
                        qtdt.GHI_CHU_HINH_THUC     as             "ghiChuHinhThuc",
                        qtdt.GHI_CHU_LOAI_BANG_CAP as             "ghiChuLoaiBangCap",
                        qtdt.TRINH_DO              as             "trinhDo",
                        qtdt.KINH_PHI              as             "kinhPhi",

                        cb.TEN                     as             "tenCanBo",
                        cb.HO                      as             "hoCanBo",
                        dv.MA                      AS             "maDonVi",
                        dv.TEN                     AS             "tenDonVi",
                        bdt.TEN                    as             "tenLoaiBangCap",
                        htdt.TEN                   as             "tenHinhThuc",
                        TDDT.TEN                   AS             "tenTrinhDo",
                        
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY qtdt.ID DESC) R
                 FROM QT_DAO_TAO qtdt
                          LEFT JOIN TCHC_CAN_BO cb on qtdt.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                          LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                          LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                          LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
                          LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                          LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                          LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                         (list_loaiBang IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdt.SHCC) != 0) OR
                            (list_shcc = qtdt.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                         OR (list_loaiBang IS NOT NULL AND INSTR(list_loaiBang, qtdt.LOAI_BANG_CAP) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL AND list_loaiBang IS NULL))
                         AND (qtdt.BAT_DAU IS NULL OR (qtdt.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtdt.BAT_DAU >= fromYear)))
                         AND (qtdt.KET_THUC IS NULL OR (qtdt.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtdt.KET_THUC <= (toYear + 86399999))))))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE ST
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST)
                 ORDER BY qtdt.BAT_DAU DESC NULLS LAST, cb.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, mucDich IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",
                        dmcv.TEN    AS "tenChucVu",
                        dmtd.TEN              AS                  "tenHocVi",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_TRINH_DO dmtd ON cb.HOC_VI = dmtd.MA
                         LEFT JOIN DM_CHUC_VU dmcv ON dmcv.MA = cb.MA_CHUC_VU
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                    OR (((list_shcc IS NOT NULL AND
                          ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn.SHCC) != 0) OR (list_shcc = qtdnn.SHCC)))
                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                        OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (mucDich IS NULL OR INSTR(mucDich, qtdnn.MUC_DICH) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                    (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                            ) OR (
                                timeType = 2 
                                AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                                AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qtdnn.NGAY_VE = -1 OR qtdnn.NGAY_VE >= today) AND tinhTrang = 2) OR
                             (qtdnn.NGAY_VE IS NOT NULL AND qtdnn.NGAY_VE != -1 AND qtdnn.NGAY_VE < today AND tinhTrang = 1))))
                 ORDER BY qtdnn.NGAY_DI DESC
             );
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_DI_NUOC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.SHCC             AS                  "shcc",

                        (SELECT COUNT(*)
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn_temp.SHCC) != 0) OR (list_shcc = qtdnn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtdnn_temp.MUC_DICH) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                            (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtdnn_temp.NGAY_VE = -1 OR qtdnn_temp.NGAY_VE >= today) AND tinhTrang = 2) OR
                                     (qtdnn_temp.NGAY_VE IS NOT NULL AND qtdnn_temp.NGAY_VE != -1 AND qtdnn_temp.NGAY_VE < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn_temp.SHCC) != 0) OR (list_shcc = qtdnn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtdnn_temp.MUC_DICH) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                            (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtdnn_temp.NGAY_VE = -1 OR qtdnn_temp.NGAY_VE >= today) AND tinhTrang = 2) OR
                                     (qtdnn_temp.NGAY_VE IS NOT NULL AND qtdnn_temp.NGAY_VE != -1 AND qtdnn_temp.NGAY_VE < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayDi",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_DI_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn_temp.SHCC) != 0) OR (list_shcc = qtdnn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtdnn_temp.MUC_DICH) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                            (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtdnn_temp.NGAY_VE = -1 OR qtdnn_temp.NGAY_VE >= today) AND tinhTrang = 2) OR
                                     (qtdnn_temp.NGAY_VE IS NOT NULL AND qtdnn_temp.NGAY_VE != -1 AND qtdnn_temp.NGAY_VE < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayDiType",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn_temp.SHCC) != 0) OR (list_shcc = qtdnn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtdnn_temp.MUC_DICH) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                            (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtdnn_temp.NGAY_VE = -1 OR qtdnn_temp.NGAY_VE >= today) AND tinhTrang = 2) OR
                                     (qtdnn_temp.NGAY_VE IS NOT NULL AND qtdnn_temp.NGAY_VE != -1 AND qtdnn_temp.NGAY_VE < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayVe",

                        (select rtrim(xmlagg(xmlelement(e, qtdnn_temp.NGAY_VE_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn_temp.SHCC) != 0) OR (list_shcc = qtdnn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtdnn_temp.MUC_DICH) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                            (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtdnn_temp.NGAY_VE = -1 OR qtdnn_temp.NGAY_VE >= today) AND tinhTrang = 2) OR
                                     (qtdnn_temp.NGAY_VE IS NOT NULL AND qtdnn_temp.NGAY_VE != -1 AND qtdnn_temp.NGAY_VE < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachNgayVeType",

                        (select rtrim(xmlagg(xmlelement(e, DMDNN.MO_TA || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_DI_NUOC_NGOAI qtdnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtdnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn_temp.MUC_DICH = DMDNN.MA
                        WHERE (qtdnn_temp.SHCC = qtdnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn_temp.SHCC) != 0) OR (list_shcc = qtdnn_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (mucDich IS NULL OR INSTR(mucDich, qtdnn_temp.MUC_DICH) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qtdnn_temp.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_DI >= fromYear)) AND
                                            (toYear IS NULL OR qtdnn_temp.NGAY_DI <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qtdnn_temp.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH >= fromYear))
                                        AND (toYear IS NULL OR qtdnn_temp.NGAY_QUYET_DINH <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qtdnn_temp.NGAY_VE = -1 OR qtdnn_temp.NGAY_VE >= today) AND tinhTrang = 2) OR
                                     (qtdnn_temp.NGAY_VE IS NOT NULL AND qtdnn_temp.NGAY_VE != -1 AND qtdnn_temp.NGAY_VE < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtdnn_temp.NOI_DUNG) LIKE sT
                            OR LOWER(DMDNN.MO_TA) LIKE sT)
                        ) AS "danhSachMucDich",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",
                        
                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM (SELECT *
                      FROM QT_DI_NUOC_NGOAI
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_DI_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                ORDER BY qtdnn.NGAY_DI DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_DI_NUOC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, mucDich IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_DI_NUOC_NGOAI qtdnn
             LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn.SHCC) != 0) OR (list_shcc = qtdnn.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
            AND (mucDich IS NULL OR INSTR(mucDich, qtdnn.MUC_DICH) != 0)
            AND (timeType = 0 OR (
                        timeType = 1 AND
                        (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                        (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                ) OR (
                    timeType = 2 
                    AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                    AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((qtdnn.NGAY_VE = -1 OR qtdnn.NGAY_VE >= today) AND tinhTrang = 2) OR
                 (qtdnn.NGAY_VE IS NOT NULL AND qtdnn.NGAY_VE != -1 AND qtdnn.NGAY_VE < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtdnn.NOI_DUNG) LIKE sT
        OR LOWER(DMDNN.MO_TA) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtdnn.ID               AS                  "id",
                        qtdnn.NOI_DUNG         AS                  "noiDung",
                        qtdnn.QUOC_GIA         AS                  "quocGia",
                        qtdnn.SHCC             AS                  "shcc",
                        qtdnn.MUC_DICH  AS "mucDich",
                        qtdnn.NGAY_DI   AS "ngayDi",
                        qtdnn.NGAY_DI_TYPE  AS "ngayDiType",
                        qtdnn.NGAY_VE   AS "ngayVe",
                        qtdnn.NGAY_VE_TYPE  AS "ngayVeType",
                        qtdnn.CHI_PHI   AS "chiPhi",
                        qtdnn.GHI_CHU   AS "ghiChu",
                        qtdnn.SO_QUYET_DINH AS "soQuyetDinh",
                        qtdnn.NGAY_QUYET_DINH   AS "ngayQuyetDinh",

                        (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by null).getclobval(), '-')
                         FROM DM_QUOC_GIA dmqg
                         WHERE INSTR(qtdnn.QUOC_GIA, dmqg.MA_CODE) != 0
                        ) AS "danhSachQuocGia",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        DMDNN.MO_TA           AS    "tenMucDich",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_DI DESC) R
                FROM QT_DI_NUOC_NGOAI qtdnn
                         LEFT JOIN TCHC_CAN_BO cb on qtdnn.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_MUC_DICH_NUOC_NGOAI DMDNN on qtdnn.MUC_DICH = DMDNN.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL) AND (mucDich IS NULL))
                    OR (((list_shcc IS NOT NULL AND
                          ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtdnn.SHCC) != 0) OR (list_shcc = qtdnn.SHCC)))
                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                        OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (mucDich IS NULL OR INSTR(mucDich, qtdnn.MUC_DICH) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qtdnn.NGAY_DI IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_DI >= fromYear)) AND
                                    (toYear IS NULL OR qtdnn.NGAY_DI <= toYear)
                            ) OR (
                                timeType = 2 
                                AND (qtdnn.NGAY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR qtdnn.NGAY_QUYET_DINH >= fromYear))
                                AND (toYear IS NULL OR qtdnn.NGAY_QUYET_DINH <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qtdnn.NGAY_VE = -1 OR qtdnn.NGAY_VE >= today) AND tinhTrang = 2) OR
                             (qtdnn.NGAY_VE IS NOT NULL AND qtdnn.NGAY_VE != -1 AND qtdnn.NGAY_VE < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qtdnn.NOI_DUNG) LIKE sT
                    OR LOWER(DMDNN.MO_TA) LIKE sT)
                 ORDER BY qtdnn.NGAY_DI DESC
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
            LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtgt.ID           AS                "id",
                        qtgt.SHCC AS "shcc",

                        (SELECT COUNT(*)
                        FROM QT_GIAI_THUONG qtgt_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtgt_temp.SHCC) != 0) OR (list_shcc = qtgt_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                            AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                           OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)
                        ) AS "soGiaiThuong",

                        (select rtrim(xmlagg(xmlelement(e, qtgt_temp.TEN_GIAI_THUONG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_GIAI_THUONG qtgt_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtgt_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtgt_temp.SHCC = qtgt.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtgt_temp.SHCC) != 0) OR (list_shcc = qtgt_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt_temp.NAM_CAP >= fromYear))
                          AND (qtgt_temp.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt_temp.NAM_CAP <= toYear))))
                            AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtgt_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtgt_temp.TEN_GIAI_THUONG) LIKE sT
                           OR LOWER(qtgt_temp.NOI_CAP) LIKE sT)
                        ) AS "danhSachGiaiThuong",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        ROW_NUMBER() OVER (ORDER BY NAM_CAP DESC) R
                FROM (SELECT *
                        FROM QT_GIAI_THUONG
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_GIAI_THUONG ORDER BY SHCC DESC ) GROUP BY SHCC)) qtgt
                         LEFT JOIN TCHC_CAN_BO cb on qtgt.SHCC = cb.SHCC
                ORDER BY qtgt.NAM_CAP DESC
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
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtgt.SHCC) != 0) OR (list_shcc = qtgt.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
      AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(qtgt.NOI_DUNG) LIKE sT
       OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
       OR LOWER(qtgt.NOI_CAP) LIKE sT);

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
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtgt.SHCC) != 0) OR (list_shcc = qtgt.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (qtgt.NAM_CAP IS NOT NULL AND (fromYear IS NULL OR qtgt.NAM_CAP >= fromYear))
                  AND (qtgt.NAM_CAP IS NOT NULL AND (toYear IS NULL OR qtgt.NAM_CAP <= toYear))))
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(qtgt.NOI_DUNG) LIKE sT
                   OR LOWER(qtgt.TEN_GIAI_THUONG) LIKE sT
                   OR LOWER(qtgt.NOI_CAP) LIKE sT)
                ORDER BY qtgt.NAM_CAP DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
            FROM QT_HOC_TAP_CONG_TAC
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC;

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

                        (SELECT COUNT(*)
                        FROM QT_HOC_TAP_CONG_TAC htct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on htct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (htct_temp.SHCC = htct.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, htct_temp.SHCC) != 0) OR (list_shcc = htct_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (htct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR htct_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((htct_temp.KET_THUC = -1 OR htct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                (htct_temp.KET_THUC IS NOT NULL AND htct_temp.KET_THUC != -1 AND htct_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(htct_temp.NOI_DUNG) LIKE ST)
                        ) AS "soNoiDung",

                        (select rtrim(xmlagg(xmlelement(e, htct_temp.NOI_DUNG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HOC_TAP_CONG_TAC htct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on htct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (htct_temp.SHCC = htct.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, htct_temp.SHCC) != 0) OR (list_shcc = htct_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (htct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR htct_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((htct_temp.KET_THUC = -1 OR htct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                (htct_temp.KET_THUC IS NOT NULL AND htct_temp.KET_THUC != -1 AND htct_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(htct_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachNoiDung",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        ROW_NUMBER() OVER (ORDER BY htct.BAT_DAU ASC) R
                FROM (SELECT *
                        FROM QT_HOC_TAP_CONG_TAC
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HOC_TAP_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) htct
                         LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                ORDER BY htct.BAT_DAU ASC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOC_TAP_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOC_TAP_CONG_TAC htct
             LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, htct.SHCC) != 0) OR (list_shcc = htct.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (
            timeType = 1 AND (htct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct.BAT_DAU >= fromYear)) AND (toYear IS NULL OR htct.BAT_DAU <= toYear)
          ))
      AND (tinhTrang IS NULL OR ((htct.KET_THUC = -1 OR htct.KET_THUC >= today) AND tinhTrang = 2) OR
        (htct.KET_THUC IS NOT NULL AND htct.KET_THUC != -1 AND htct.KET_THUC < today AND tinhTrang = 1))))
        AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(htct.NOI_DUNG) LIKE ST);

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

                        today   as "today",
                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY htct.BAT_DAU DESC) R
                 FROM QT_HOC_TAP_CONG_TAC htct
                          LEFT JOIN TCHC_CAN_BO cb on htct.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL))
                        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, htct.SHCC) != 0) OR (list_shcc = htct.SHCC)))
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                      AND (timeType = 0 OR (
                            timeType = 1 AND (htct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR htct.BAT_DAU >= fromYear)) AND (toYear IS NULL OR htct.BAT_DAU <= toYear)
                          ))
                      AND (tinhTrang IS NULL OR ((htct.KET_THUC = -1 OR htct.KET_THUC >= today) AND tinhTrang = 2) OR
                        (htct.KET_THUC IS NOT NULL AND htct.KET_THUC != -1 AND htct.KET_THUC < today AND tinhTrang = 1))))
                      AND (searchTerm = ''
                        OR LOWER(cb.SHCC) LIKE ST
                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                        OR LOWER(htct.NOI_DUNG) LIKE ST)
                 ORDER BY htct.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DVTL_TN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HOP_DONG_DVTL_TN hd
                LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
                LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN cbdvtl ON hd.NGUOI_DUOC_THUE = cbdvtl.SHCC;

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
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_DVTL_TN hd_temp
                                    LEFT JOIN TCHC_CAN_BO cbk on hd_temp.NGUOI_KY = cbk.SHCC
                                    LEFT JOIN DM_DIEN_HOP_DONG dhd ON hd_temp.KIEU_HOP_DONG = dhd.MA
                                    LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN cbdvtl ON hd_temp.NGUOI_DUOC_THUE = cbdvtl.SHCC
                                    LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd_temp.LOAI_HOP_DONG = lhd.MA
                                    LEFT JOIN DM_DON_VI dv on hd_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                    LEFT JOIN DM_DON_VI dvct on hd_temp.DON_VI_CHI_TRA = dvct.MA
                                LEFT JOIN DM_CHUC_VU DCV on hd_temp.CHUC_DANH_CHUYEN_MON = DCV.MA
                        WHERE (hd_temp.NGUOI_DUOC_THUE = hd.NGUOI_DUOC_THUE)
                            AND (((fromYear IS NULL) AND (toYear IS NULL))
                            OR (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                            AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999))))
                            AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(cbdvtl.HO || ' ' || cbdvtl.TEN)) LIKE sT
                            OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT
                            or lower(hd_temp.KIEU_HOP_DONG) LIKE sT)
                        )                  AS                   "soHd",
                        (select rtrim(xmlagg(
                                              xmlelement(e, hd_temp.NGAY_KY_HOP_DONG || ' ', '??').extract('//text()')
                                              order by null).getclobval(), '??')
                        FROM QT_HOP_DONG_DVTL_TN hd_temp
                                    LEFT JOIN TCHC_CAN_BO cbk on hd_temp.NGUOI_KY = cbk.SHCC
                                    LEFT JOIN DM_DIEN_HOP_DONG dhd ON hd_temp.KIEU_HOP_DONG = dhd.MA
                                    LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN cbdvtl ON hd_temp.NGUOI_DUOC_THUE = cbdvtl.SHCC
                                    LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd_temp.LOAI_HOP_DONG = lhd.MA
                                    LEFT JOIN DM_DON_VI dv on hd_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                    LEFT JOIN DM_DON_VI dvct on hd_temp.DON_VI_CHI_TRA = dvct.MA
                                LEFT JOIN DM_CHUC_VU DCV on hd_temp.CHUC_DANH_CHUYEN_MON = DCV.MA
                        WHERE (hd_temp.NGUOI_DUOC_THUE = hd.NGUOI_DUOC_THUE)
                            AND (((fromYear IS NULL) AND (toYear IS NULL))
                            OR (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                            AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999))))
                            AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(cbdvtl.HO || ' ' || cbdvtl.TEN)) LIKE sT
                            OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT
                            or lower(hd_temp.KIEU_HOP_DONG) LIKE sT)
                        )                  AS                   "danhSachHd",
                         ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG DESC, hd.SO_HOP_DONG DESC) R
                    FROM QT_HOP_DONG_DVTL_TN hd
                                LEFT JOIN TCHC_CAN_BO cbk on hd.NGUOI_KY = cbk.SHCC
                                LEFT JOIN TCHC_CAN_BO_HOP_DONG_DVTL_TN cbdvtl ON hd.NGUOI_DUOC_THUE = cbdvtl.SHCC
                    ORDER BY hd.NGAY_KY_HOP_DONG DESC, hd.SO_HOP_DONG DESC
            )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_DVTL_TN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
                                                 totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
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
    WHERE (((fromYear IS NULL) AND (toYear IS NULL))
        OR (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
        AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999))))
        AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(cbdvtl.HO || ' ' || cbdvtl.TEN)) LIKE sT
        OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT
        or lower(hd.KIEU_HOP_DONG) LIKE sT);

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
                WHERE (((fromYear IS NULL) AND (toYear IS NULL))
                    OR (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
                    AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999))))
                    AND (searchTerm = ''
                    OR LOWER(hd.NGUOI_KY) LIKE sT
                    OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                    OR LOWER(TRIM(cbdvtl.HO || ' ' || cbdvtl.TEN)) LIKE sT
                    OR LOWER(TRIM(cbk.HO || ' ' || cbk.TEN)) LIKE sT
                    OR LOWER(hd.SO_HOP_DONG) LIKE sT
                    or lower(hd.KIEU_HOP_DONG) LIKE sT)
                    ORDER BY hd.NGAY_KY_HOP_DONG DESC, hd.SO_HOP_DONG DESC
            )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_LAO_DONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
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
          FROM QT_HOP_DONG_LAO_DONG
          WHERE MA IN
                (SELECT MAX(MA) FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG ORDER BY MA DESC) GROUP BY NGUOI_DUOC_THUE)) hd
             LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_DUOC_THUE = benA.SHCC
             LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hd.NGUOI_DUOC_THUE AS                   "shcc",
                        hd.MA              AS                   "ma",
                        benA.HO            AS                   "hoBenA",
                        benA.TEN           AS                   "tenBenA",
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_LAO_DONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.NGUOI_DUOC_THUE = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (hd_temp.NGUOI_DUOC_THUE = hd.NGUOI_DUOC_THUE)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "soHd",

                        (select rtrim(xmlagg(
                                              xmlelement(e, hd_temp.NGAY_KY_HOP_DONG || ' ', '??').extract('//text()')
                                              order by null).getclobval(), '??')
                        FROM QT_HOP_DONG_LAO_DONG hd_temp
                                 LEFT JOIN TCHC_CAN_BO nguoiKy on hd_temp.NGUOI_KY = nguoiKy.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd_temp.LOAI_HOP_DONG = dhd.MA
                                 LEFT JOIN TCHC_CAN_BO benA ON hd_temp.NGUOI_DUOC_THUE = benA.SHCC
                                 LEFT JOIN DM_DON_VI dv on hd_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hd_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (hd_temp.NGUOI_DUOC_THUE = hd.NGUOI_DUOC_THUE)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG >= fromYear))
                                AND (hd_temp.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd_temp.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hd_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hd_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                            OR LOWER(hd_temp.SO_HOP_DONG) LIKE sT)
                        )                  AS                   "danhSachHd",

                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG, benA.TEN DESC) R
                 FROM (SELECT *
                       FROM QT_HOP_DONG_LAO_DONG
                       WHERE MA IN
                             (SELECT MAX(MA)
                              FROM (SELECT * FROM QT_HOP_DONG_LAO_DONG ORDER BY MA DESC)
                              GROUP BY NGUOI_DUOC_THUE)) hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_DUOC_THUE = benA.SHCC
                          LEFT JOIN TCHC_CAN_BO nguoiKy on hd.NGUOI_KY = nguoiKy.SHCC
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_LAO_DONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                 list_shcc IN STRING, list_dv IN STRING,
                                                 fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
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
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR (list_shcc = benA.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
            AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
      AND (searchTerm = ''
        OR LOWER(hd.NGUOI_KY) LIKE sT
        OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
        OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
        OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
        OR LOWER(hd.SO_HOP_DONG) LIKE sT);

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
                        dhd.TEN                 as              "tenLoaiHopDong",
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
                          LEFT JOIN DM_LOAI_HOP_DONG dhd ON hd.LOAI_HOP_DONG = dhd.MA
                          LEFT JOIN TCHC_CAN_BO benA ON hd.NGUOI_DUOC_THUE = benA.SHCC
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benA.SHCC) != 0) OR
                            (list_shcc = benA.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, benA.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_HOP_DONG >= fromYear))
                         AND (hd.NGAY_KY_HOP_DONG IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_HOP_DONG <= (toYear + 86399999)))))
                   AND (searchTerm = ''
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                     OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                     OR LOWER(TRIM(nguoiKy.HO || ' ' || nguoiKy.TEN)) LIKE sT
                     OR LOWER(hd.SO_HOP_DONG) LIKE sT)
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benA.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_VIEN_CHUC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
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
          FROM QT_HOP_DONG_VIEN_CHUC
          WHERE MA IN (
              SELECT MAX(MA)
              FROM (SELECT * FROM QT_HOP_DONG_VIEN_CHUC ORDER BY NGUOI_DUOC_THUE DESC)
              GROUP BY NGUOI_DUOC_THUE)) hdvc
             LEFT JOIN TCHC_CAN_BO cb on hdvc.NGUOI_DUOC_THUE = cb.SHCC;

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdvc.MA           AS                "ma",
                        hdvc.NGUOI_DUOC_THUE AS "shcc",
                        (SELECT COUNT(*)
                        FROM QT_HOP_DONG_VIEN_CHUC hdvc_temp
                                 LEFT JOIN TCHC_CAN_BO benA on hdvc_temp.NGUOI_KY = benA.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG lhd ON hdvc_temp.LOAI_HD = lhd.MA
                                 LEFT JOIN TCHC_CAN_BO benB ON hdvc_temp.NGUOI_DUOC_THUE = benB.SHCC
                                 LEFT JOIN DM_DON_VI dv on hdvc_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hdvc_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hdvc_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (TO_CHAR(hdvc_temp.NGUOI_DUOC_THUE) = TO_CHAR(hdvc.NGUOI_DUOC_THUE))
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR (list_shcc = benB.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH >= fromYear))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hdvc_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hdvc_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                            OR LOWER(hdvc_temp.SO_QD) LIKE sT
                            OR LOWER(ncdnn.TEN) LIKE sT)
                        ) AS "soHd",

                        (select rtrim(xmlagg(xmlelement(e, hdvc_temp.NGAY_KY_QUYET_DINH || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HOP_DONG_VIEN_CHUC hdvc_temp
                                 LEFT JOIN TCHC_CAN_BO benA on hdvc_temp.NGUOI_KY = benA.SHCC
                                 LEFT JOIN DM_LOAI_HOP_DONG lhd ON hdvc_temp.LOAI_HD = lhd.MA
                                 LEFT JOIN TCHC_CAN_BO benB ON hdvc_temp.NGUOI_DUOC_THUE = benB.SHCC
                                 LEFT JOIN DM_DON_VI dv on hdvc_temp.DIA_DIEM_LAM_VIEC = dv.MA
                                 LEFT JOIN DM_NGACH_CDNN ncdnn ON hdvc_temp.MA_NGACH = ncdnn.MA
                                 LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hdvc_temp.CHUC_DANH_CHUYEN_MON = cdcm.MA
                        WHERE (TO_CHAR(hdvc_temp.NGUOI_DUOC_THUE) = TO_CHAR(hdvc.NGUOI_DUOC_THUE))
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR (list_shcc = benB.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH >= fromYear))
                                AND (hdvc_temp.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hdvc_temp.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
                          AND (searchTerm = ''
                            OR LOWER(hdvc_temp.NGUOI_KY) LIKE sT
                            OR LOWER(hdvc_temp.NGUOI_DUOC_THUE) LIKE sT
                            OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                            OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                            OR LOWER(hdvc_temp.SO_QD) LIKE sT
                            OR LOWER(ncdnn.TEN) LIKE sT)
                        ) AS "danhSachHd",

                        cb.TEN               as                                  "tenBenB",
                        cb.HO                as                                  "hoBenB",

                        ROW_NUMBER() OVER (ORDER BY NGAY_KY_QUYET_DINH DESC) R
                FROM (SELECT *
                      FROM QT_HOP_DONG_VIEN_CHUC
                      WHERE MA IN (
                          SELECT MAX(MA)
                          FROM (SELECT * FROM QT_HOP_DONG_VIEN_CHUC ORDER BY NGUOI_DUOC_THUE DESC)
                          GROUP BY NGUOI_DUOC_THUE)) hdvc
                         LEFT JOIN TCHC_CAN_BO cb on hdvc.NGUOI_DUOC_THUE = cb.SHCC
                ORDER BY hdvc.NGAY_KY_QUYET_DINH DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HOP_DONG_VIEN_CHUC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  list_shcc IN STRING, list_dv IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, searchTerm IN STRING,
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
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR (list_shcc = benB.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_QUYET_DINH >= fromYear))
            AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
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
                        ROW_NUMBER() OVER (ORDER BY hd.NGAY_KY_HOP_DONG DESC) R
                 FROM QT_HOP_DONG_VIEN_CHUC hd
                          LEFT JOIN TCHC_CAN_BO benA on hd.NGUOI_KY = benA.SHCC
                          LEFT JOIN DM_LOAI_HOP_DONG lhd ON hd.LOAI_HD = lhd.MA
                          LEFT JOIN TCHC_CAN_BO benB ON hd.NGUOI_DUOC_THUE = benB.SHCC
                          LEFT JOIN DM_DON_VI dv on hd.DIA_DIEM_LAM_VIEC = dv.MA
                          LEFT JOIN DM_NGACH_CDNN ncdnn ON hd.MA_NGACH = ncdnn.MA
                          LEFT JOIN DM_CHUC_DANH_CHUYEN_MON cdcm on hd.CHUC_DANH_CHUYEN_MON = cdcm.MA
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, benB.SHCC) != 0) OR
                            (list_shcc = benB.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, benB.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (fromYear IS NULL OR hd.NGAY_KY_QUYET_DINH >= fromYear))
                         AND (hd.NGAY_KY_QUYET_DINH IS NOT NULL AND (toYear IS NULL OR hd.NGAY_KY_QUYET_DINH <= (toYear + 86399999)))))
                   AND (searchTerm = ''
                     OR LOWER(hd.NGUOI_KY) LIKE sT
                     OR LOWER(hd.NGUOI_DUOC_THUE) LIKE sT
                     OR LOWER(TRIM(benA.HO || ' ' || benA.TEN)) LIKE sT
                     OR LOWER(TRIM(benB.HO || ' ' || benB.TEN)) LIKE sT
                     OR LOWER(hd.SO_QD) LIKE sT
                     OR LOWER(ncdnn.TEN) LIKE sT)
                 ORDER BY hd.NGAY_KY_HOP_DONG DESC, benB.TEN DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HO_TRO_HOC_PHI_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qththp.ID               AS                  "id",
                        qththp.SHCC             AS                  "shcc",
                        qththp.BAT_DAU   AS "batDau",
                        qththp.BAT_DAU_TYPE  AS "batDauType",
                        qththp.KET_THUC   AS "ketThuc",
                        qththp.KET_THUC_TYPE  AS "ketThucType",
                        qththp.GHI_CHU   AS "ghiChu",
                        qththp.HO_SO AS "hoSo",
                        qththp.NGAY_LAM_DON   AS "ngayLamDon",
                        qththp.NOI_DUNG   AS "noiDung",
                        qththp.SO_TIEN   AS "soTien",
                        qththp.CO_SO_DAO_TAO   AS "coSoDaoTao",
                        qththp.HOC_KY_HO_TRO AS "hocKyHoTro",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",
                        cb.CHUYEN_NGANH AS "tenChuyenNganh",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        dmhthpcs.TEN    AS "tenCoSoDaoTao",
                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM QT_HO_TRO_HOC_PHI qththp
                         LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                    OR (((list_shcc IS NOT NULL AND
                          ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp.SHCC) != 0) OR (list_shcc = qththp.SHCC)))
                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                        OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qththp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp.BAT_DAU >= fromYear)) AND
                                    (toYear IS NULL OR qththp.BAT_DAU <= toYear)
                            ) OR (
                                timeType = 2
                                AND (qththp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp.NGAY_LAM_DON >= fromYear))
                                AND (toYear IS NULL OR qththp.NGAY_LAM_DON <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qththp.KET_THUC = -1 OR qththp.KET_THUC >= today) AND tinhTrang = 2) OR
                             (qththp.KET_THUC IS NOT NULL AND qththp.KET_THUC != -1 AND qththp.KET_THUC < today AND tinhTrang = 1))))
                 ORDER BY qththp.BAT_DAU DESC
             );
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HO_TRO_HOC_PHI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
            FROM QT_HO_TRO_HOC_PHI
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_HO_TRO_HOC_PHI ORDER BY SHCC DESC ) GROUP BY SHCC)) qththp
            LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qththp.ID               AS                  "id",
                        qththp.SHCC             AS                  "shcc",
                        (SELECT COUNT(*)
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp_temp.SHCC) != 0) OR (list_shcc = qththp_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp_temp.SHCC) != 0) OR (list_shcc = qththp_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp_temp.SHCC) != 0) OR (list_shcc = qththp_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachBatDauType",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp_temp.SHCC) != 0) OR (list_shcc = qththp_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp_temp.SHCC) != 0) OR (list_shcc = qththp_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, qththp_temp.NOI_DUNG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_HO_TRO_HOC_PHI qththp_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qththp_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp_temp.CO_SO_DAO_TAO
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qththp_temp.SHCC = qththp.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                            OR (((list_shcc IS NOT NULL AND
                                  ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp_temp.SHCC) != 0) OR (list_shcc = qththp_temp.SHCC)))
                                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                                OR (list_shcc IS NULL AND list_dv IS NULL))
                                AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                                AND (timeType = 0 OR (
                                            timeType = 1 AND
                                            (qththp_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp_temp.BAT_DAU >= fromYear)) AND
                                            (toYear IS NULL OR qththp_temp.BAT_DAU <= toYear)
                                    ) OR (
                                        timeType = 2
                                        AND (qththp_temp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp_temp.NGAY_LAM_DON >= fromYear))
                                        AND (toYear IS NULL OR qththp_temp.NGAY_LAM_DON <= toYear)
                                    ))
                                AND (tinhTrang IS NULL OR ((qththp_temp.KET_THUC = -1 OR qththp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                     (qththp_temp.KET_THUC IS NOT NULL AND qththp_temp.KET_THUC != -1 AND qththp_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qththp_temp.NOI_DUNG) LIKE sT
                            OR LOWER(qththp_temp.HO_SO) LIKE sT)
                        ) AS "danhSachNoiDung",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",
                        cb.CHUYEN_NGANH AS "tenChuyenNganh",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM (SELECT *
                        FROM QT_HO_TRO_HOC_PHI
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HO_TRO_HOC_PHI ORDER BY SHCC DESC ) GROUP BY SHCC)) qththp
                        LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 ORDER BY qththp.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_HO_TRO_HOC_PHI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          loaiHocVi IN STRING, searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_HO_TRO_HOC_PHI qththp
             LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp.SHCC) != 0) OR (list_shcc = qththp.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
            AND (timeType = 0 OR (
                        timeType = 1 AND
                        (qththp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR qththp.BAT_DAU <= toYear)
                ) OR (
                    timeType = 2
                    AND (qththp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp.NGAY_LAM_DON >= fromYear))
                    AND (toYear IS NULL OR qththp.NGAY_LAM_DON <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((qththp.KET_THUC = -1 OR qththp.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qththp.KET_THUC IS NOT NULL AND qththp.KET_THUC != -1 AND qththp.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qththp.NOI_DUNG) LIKE sT
        OR LOWER(qththp.HO_SO) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qththp.ID               AS                  "id",
                        qththp.SHCC             AS                  "shcc",
                        qththp.BAT_DAU   AS "batDau",
                        qththp.BAT_DAU_TYPE  AS "batDauType",
                        qththp.KET_THUC   AS "ketThuc",
                        qththp.KET_THUC_TYPE  AS "ketThucType",
                        qththp.GHI_CHU   AS "ghiChu",
                        qththp.HO_SO AS "hoSo",
                        qththp.NGAY_LAM_DON   AS "ngayLamDon",
                        qththp.NOI_DUNG   AS "noiDung",
                        qththp.SO_TIEN   AS "soTien",
                        qththp.CO_SO_DAO_TAO   AS "coSoDaoTao",
                        qththp.HOC_KY_HO_TRO AS "hocKyHoTro",
                    
                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",
                        cb.CHUYEN_NGANH AS "tenChuyenNganh",
                        
                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        dmhthpcs.TEN    AS "tenCoSoDaoTao",
                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM QT_HO_TRO_HOC_PHI qththp
                         LEFT JOIN TCHC_CAN_BO cb on qththp.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_HO_TRO_HOC_PHI_CO_SO dmhthpcs on dmhthpcs.MA = qththp.CO_SO_DAO_TAO
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL) AND (loaiHocVi IS NULL))
                    OR (((list_shcc IS NOT NULL AND
                          ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qththp.SHCC) != 0) OR (list_shcc = qththp.SHCC)))
                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                        OR (list_shcc IS NULL AND list_dv IS NULL))
                        AND (loaiHocVi IS NULL OR INSTR(loaiHocVi, cb.HOC_VI) != 0)
                        AND (timeType = 0 OR (
                                    timeType = 1 AND
                                    (qththp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qththp.BAT_DAU >= fromYear)) AND
                                    (toYear IS NULL OR qththp.BAT_DAU <= toYear)
                            ) OR (
                                timeType = 2
                                AND (qththp.NGAY_LAM_DON IS NOT NULL AND (fromYear IS NULL OR qththp.NGAY_LAM_DON >= fromYear))
                                AND (toYear IS NULL OR qththp.NGAY_LAM_DON <= toYear)
                            ))
                        AND (tinhTrang IS NULL OR ((qththp.KET_THUC = -1 OR qththp.KET_THUC >= today) AND tinhTrang = 2) OR
                             (qththp.KET_THUC IS NOT NULL AND qththp.KET_THUC != -1 AND qththp.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE sT
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                    OR LOWER(qththp.NOI_DUNG) LIKE sT
                    OR LOWER(qththp.HO_SO) LIKE sT)
                 ORDER BY qththp.BAT_DAU DESC
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
            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT hdlv.ID             AS               "id",
                        hdlv.SHCC           AS  "shcc",
                        cb.HO               AS               "hoCanBo",
                        cb.TEN              AS               "tenCanBo",
                        (SELECT COUNT(*)
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                                    OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, hdlv_temp.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP >= fromYear))
                              AND (hdlv_temp.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp.NAM_TOT_NGHIEP <= toYear))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE sT
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                OR LOWER(hdlv_temp.TEN_LUAN_VAN) LIKE sT
                                OR LOWER(hdlv_temp.SAN_PHAM) LIKE sT)
                        ) AS "soDeTai",

                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp2.HO_TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp2
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp2.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp2.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                                    OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, hdlv_temp2.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (hdlv_temp2.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp2.NAM_TOT_NGHIEP >= fromYear))
                              AND (hdlv_temp2.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp2.NAM_TOT_NGHIEP <= toYear))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE sT
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                OR LOWER(hdlv_temp2.TEN_LUAN_VAN) LIKE sT
                                OR LOWER(hdlv_temp2.SAN_PHAM) LIKE sT)
                        ) AS "danhSachHoTen",
                        (select rtrim(xmlagg(xmlelement(e, hdlv_temp3.TEN_LUAN_VAN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_HUONG_DAN_LUAN_VAN hdlv_temp3
                            LEFT JOIN TCHC_CAN_BO cb on hdlv_temp3.SHCC = cb.SHCC
                            LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         WHERE hdlv_temp3.SHCC = hdlv.SHCC
                             AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                                    OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, hdlv_temp3.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                              AND (hdlv_temp3.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv_temp3.NAM_TOT_NGHIEP >= fromYear))
                              AND (hdlv_temp3.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv_temp3.NAM_TOT_NGHIEP <= toYear))))
                              AND (searchTerm = ''
                                OR LOWER(cb.SHCC) LIKE sT
                                OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                                OR LOWER(hdlv_temp3.TEN_LUAN_VAN) LIKE sT
                                OR LOWER(hdlv_temp3.SAN_PHAM) LIKE sT)
                        ) AS "danhSachDeTai",

                        dv.MA               AS               "maDonVi",
                        dv.TEN              AS               "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY hdlv.NAM_TOT_NGHIEP DESC, hdlv.SHCC DESC) R
                FROM (SELECT *
                        FROM QT_HUONG_DAN_LUAN_VAN
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_HUONG_DAN_LUAN_VAN ORDER BY SHCC DESC ) GROUP BY SHCC)) hdlv
                        LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                        LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 ORDER BY hdlv.NAM_TOT_NGHIEP DESC, hdlv.SHCC DESC
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
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, hdlv.SHCC) != 0) OR (list_shcc = hdlv.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear))
      AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear))))
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

                        ROW_NUMBER() OVER (ORDER BY hdlv.NAM_TOT_NGHIEP DESC) R
                 FROM QT_HUONG_DAN_LUAN_VAN hdlv
                          LEFT JOIN TCHC_CAN_BO cb on hdlv.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, hdlv.SHCC) != 0) OR (list_shcc = hdlv.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (fromYear IS NULL OR hdlv.NAM_TOT_NGHIEP >= fromYear))
                  AND (hdlv.NAM_TOT_NGHIEP IS NOT NULL AND (toYear IS NULL OR hdlv.NAM_TOT_NGHIEP <= toYear))))
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

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
            FROM QT_KEO_DAI_CONG_TAC
            WHERE ID IN (
                SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC;

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

                        (SELECT COUNT(*)
                         FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                  LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                  LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, kdct_temp.SHCC) != 0) OR (list_shcc = kdct_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((kdct_temp.KET_THUC = -1 OR kdct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (kdct_temp.KET_THUC IS NOT NULL AND kdct_temp.KET_THUC != -1 AND kdct_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, kdct_temp.SHCC) != 0) OR (list_shcc = kdct_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((kdct_temp.KET_THUC = -1 OR kdct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (kdct_temp.KET_THUC IS NOT NULL AND kdct_temp.KET_THUC != -1 AND kdct_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, kdct_temp.SHCC) != 0) OR (list_shcc = kdct_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((kdct_temp.KET_THUC = -1 OR kdct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (kdct_temp.KET_THUC IS NOT NULL AND kdct_temp.KET_THUC != -1 AND kdct_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, kdct_temp.SHCC) != 0) OR (list_shcc = kdct_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((kdct_temp.KET_THUC = -1 OR kdct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (kdct_temp.KET_THUC IS NOT NULL AND kdct_temp.KET_THUC != -1 AND kdct_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, kdct_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KEO_DAI_CONG_TAC kdct_temp
                                 LEFT JOIN TCHC_CAN_BO cb on kdct_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (kdct_temp.SHCC = kdct.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, kdct_temp.SHCC) != 0) OR (list_shcc = kdct_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (kdct_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((kdct_temp.KET_THUC = -1 OR kdct_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (kdct_temp.KET_THUC IS NOT NULL AND kdct_temp.KET_THUC != -1 AND kdct_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(kdct_temp.SO_HIEU_VAN_BAN) LIKE ST)
                        ) AS "danhSachBatDauType",

                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",

                        ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC ) R
                FROM (SELECT *
                        FROM QT_KEO_DAI_CONG_TAC
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_KEO_DAI_CONG_TAC ORDER BY SHCC DESC ) GROUP BY SHCC)) kdct
                         LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                ORDER BY kdct.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KEO_DAI_CONG_TAC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_KEO_DAI_CONG_TAC kdct
             LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, kdct.SHCC) != 0) OR (list_shcc = kdct.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (
            timeType = 1 AND (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct.BAT_DAU <= toYear)
          ))
      AND (tinhTrang IS NULL OR ((kdct.KET_THUC = -1 OR kdct.KET_THUC >= today) AND tinhTrang = 2) OR
        (kdct.KET_THUC IS NOT NULL AND kdct.KET_THUC != -1 AND kdct.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(kdct.SO_HIEU_VAN_BAN) LIKE ST);

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

                        today   AS "today",
                        cb.TEN             as   "tenCanBo",
                        cb.HO              as   "hoCanBo",
                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY kdct.BAT_DAU DESC) R
                 FROM QT_KEO_DAI_CONG_TAC kdct
                          LEFT JOIN TCHC_CAN_BO cb on kdct.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, kdct.SHCC) != 0) OR (list_shcc = kdct.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (
                        timeType = 1 AND (kdct.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR kdct.BAT_DAU >= fromYear)) AND (toYear IS NULL OR kdct.BAT_DAU <= toYear)
                      ))
                  AND (tinhTrang IS NULL OR ((kdct.KET_THUC = -1 OR kdct.KET_THUC >= today) AND tinhTrang = 2) OR
                    (kdct.KET_THUC IS NOT NULL AND kdct.KET_THUC != -1 AND kdct.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                    OR LOWER(kdct.SO_HIEU_VAN_BAN) LIKE ST)
                 ORDER BY kdct.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_DOWNLOAD_EXCEL(loaiDoiTuong IN STRING,
                                            fromYear IN NUMBER, toYear IN NUMBER, list_dv IN STRING, list_shcc IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA           AS                "ma",
                        qtkta.ID           AS                "id",
                        qtkta.nam_dat_duoc AS                "namDatDuoc",
                        qtkta.DIEM_THI_DUA AS                "diemThiDua",
                        qtkta.SO_QUYET_DINH AS "soQuyetDinh",
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
                    AND ((list_shcc IS NULL AND list_dv IS NULL)
                        OR ((qtkta.LOAI_DOI_TUONG = '02') AND
                            ((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkta.MA) != 0) OR (list_shcc = qtkta.MA)))
                            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0))))
                    AND ((
                            (fromYear IS NULL) AND (toYear IS NULL)
                        ) OR (
                              (qtkta.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                               (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear)))
                              AND (qtkta.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                   (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear)))
                        ))
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
             );
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                            fromYear IN NUMBER, toYear IN NUMBER, list_dv IN STRING, list_shcc IN STRING,
                                            searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
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
    WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG));
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkta.MA    AS  "ma",
                        qtkta.ID    AS  "id",

                        (SELECT COUNT(*)
                        FROM QT_KHEN_THUONG_ALL qtkta_temp
                                 LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta_temp.LOAI_DOI_TUONG
                                 LEFT JOIN TCHC_CAN_BO cb on (qtkta_temp.LOAI_DOI_TUONG = '02' and qtkta_temp.MA = cb.SHCC)
                                 LEFT JOIN DM_DON_VI dv on (qtkta_temp.LOAI_DOI_TUONG = '03' and qtkta_temp.MA = TO_CHAR(dv.MA))
                                 LEFT JOIN DM_BO_MON bm on (qtkta_temp.LOAI_DOI_TUONG = '04' and qtkta_temp.MA = TO_CHAR(bm.MA))
                                 LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta_temp.THANH_TICH = ktkh.MA
                                 LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta_temp.CHU_THICH = ktct.MA
                        WHERE (qtkta_temp.LOAI_DOI_TUONG = qtkta.LOAI_DOI_TUONG AND qtkta_temp.MA = qtkta.MA)
                            AND (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta_temp.LOAI_DOI_TUONG))
                                AND ((list_shcc IS NULL AND list_dv IS NULL)
                                    OR ((qtkta_temp.LOAI_DOI_TUONG = '02') AND
                                        ((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkta_temp.MA) != 0) OR (list_shcc = qtkta_temp.MA)))
                                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0))))
                                AND ((
                                        (fromYear IS NULL) AND (toYear IS NULL)
                                    ) OR (
                                          (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                                           (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) >= fromYear)))
                                          AND (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                               (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) <= toYear)))
                                    ))
                                AND (searchTerm = ''
                               OR LOWER(cb.SHCC) LIKE sT
                               OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                               OR LOWER(TRIM(dv.TEN)) LIKE sT
                               OR LOWER(TRIM(bm.TEN)) LIKE sT
                               OR LOWER(ldt.TEN) like sT
                               OR LOWER(TRIM(ktct.TEN)) LIKE sT
                               OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                        ) AS "soKhenThuong",

                        (select rtrim(xmlagg(xmlelement(e, ktkh.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KHEN_THUONG_ALL qtkta_temp
                                 LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta_temp.LOAI_DOI_TUONG
                                 LEFT JOIN TCHC_CAN_BO cb on (qtkta_temp.LOAI_DOI_TUONG = '02' and qtkta_temp.MA = cb.SHCC)
                                 LEFT JOIN DM_DON_VI dv on (qtkta_temp.LOAI_DOI_TUONG = '03' and qtkta_temp.MA = TO_CHAR(dv.MA))
                                 LEFT JOIN DM_BO_MON bm on (qtkta_temp.LOAI_DOI_TUONG = '04' and qtkta_temp.MA = TO_CHAR(bm.MA))
                                 LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta_temp.THANH_TICH = ktkh.MA
                                 LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta_temp.CHU_THICH = ktct.MA
                        WHERE (qtkta_temp.LOAI_DOI_TUONG = qtkta.LOAI_DOI_TUONG AND qtkta_temp.MA = qtkta.MA)
                            AND (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta_temp.LOAI_DOI_TUONG))
                                AND ((list_shcc IS NULL AND list_dv IS NULL)
                                    OR ((qtkta_temp.LOAI_DOI_TUONG = '02') AND
                                        ((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkta_temp.MA) != 0) OR (list_shcc = qtkta_temp.MA)))
                                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0))))
                                AND ((
                                        (fromYear IS NULL) AND (toYear IS NULL)
                                    ) OR (
                                          (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                                           (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) >= fromYear)))
                                          AND (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                               (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) <= toYear)))
                                    ))
                                AND (searchTerm = ''
                               OR LOWER(cb.SHCC) LIKE sT
                               OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                               OR LOWER(TRIM(dv.TEN)) LIKE sT
                               OR LOWER(TRIM(bm.TEN)) LIKE sT
                               OR LOWER(ldt.TEN) like sT
                               OR LOWER(TRIM(ktct.TEN)) LIKE sT
                               OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                        ) AS "danhSachKhenThuong",

                        (select rtrim(xmlagg(xmlelement(e, qtkta_temp.NAM_DAT_DUOC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KHEN_THUONG_ALL qtkta_temp
                                 LEFT JOIN DM_KHEN_THUONG_LOAI_DOI_TUONG ldt on ldt.MA = qtkta_temp.LOAI_DOI_TUONG
                                 LEFT JOIN TCHC_CAN_BO cb on (qtkta_temp.LOAI_DOI_TUONG = '02' and qtkta_temp.MA = cb.SHCC)
                                 LEFT JOIN DM_DON_VI dv on (qtkta_temp.LOAI_DOI_TUONG = '03' and qtkta_temp.MA = TO_CHAR(dv.MA))
                                 LEFT JOIN DM_BO_MON bm on (qtkta_temp.LOAI_DOI_TUONG = '04' and qtkta_temp.MA = TO_CHAR(bm.MA))
                                 LEFT JOIN DM_KHEN_THUONG_KY_HIEU ktkh ON qtkta_temp.THANH_TICH = ktkh.MA
                                 LEFT JOIN DM_KHEN_THUONG_CHU_THICH ktct ON qtkta_temp.CHU_THICH = ktct.MA
                        WHERE (qtkta_temp.LOAI_DOI_TUONG = qtkta.LOAI_DOI_TUONG AND qtkta_temp.MA = qtkta.MA)
                            AND (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta_temp.LOAI_DOI_TUONG))
                                AND ((list_shcc IS NULL AND list_dv IS NULL)
                                    OR ((qtkta_temp.LOAI_DOI_TUONG = '02') AND
                                        ((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkta_temp.MA) != 0) OR (list_shcc = qtkta_temp.MA)))
                                        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0))))
                                AND ((
                                        (fromYear IS NULL) AND (toYear IS NULL)
                                    ) OR (
                                          (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                                           (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) >= fromYear)))
                                          AND (qtkta_temp.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                               (TO_NUMBER(qtkta_temp.NAM_DAT_DUOC) <= toYear)))
                                    ))
                                AND (searchTerm = ''
                               OR LOWER(cb.SHCC) LIKE sT
                               OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                               OR LOWER(TRIM(dv.TEN)) LIKE sT
                               OR LOWER(TRIM(bm.TEN)) LIKE sT
                               OR LOWER(ldt.TEN) like sT
                               OR LOWER(TRIM(ktct.TEN)) LIKE sT
                               OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                        ) AS "danhSachNamDatDuoc",

                        ldt.MA  AS "maLoaiDoiTuong",
                        ldt.TEN AS "tenLoaiDoiTuong",

                        cb.SHCC AS "maCanBo",
                        cb.HO   AS  "hoCanBo",
                        cb.TEN  AS  "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        bm.MA              AS                "maBoMon",
                        bm.TEN             AS                "tenBoMon",
                        bm.MA_DV           AS                "maDonViBoMon",
                        dv2.TEN            AS                "tenDonViBoMon",
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
                WHERE (loaiDoiTuong = '-1' OR (loaiDoiTuong = qtkta.LOAI_DOI_TUONG))
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
            )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND  pageNumber * pageSize;
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KHEN_THUONG_ALL_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, loaiDoiTuong IN STRING,
                                            fromYear IN NUMBER, toYear IN NUMBER, list_dv IN STRING, list_shcc IN STRING,
                                            searchTerm IN STRING, totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
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
        AND ((list_shcc IS NULL AND list_dv IS NULL)
            OR ((qtkta.LOAI_DOI_TUONG = '02') AND
                ((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkta.MA) != 0) OR (list_shcc = qtkta.MA)))
                OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0))))
        AND ((
                (fromYear IS NULL) AND (toYear IS NULL)
            ) OR (
                  (qtkta.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                   (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear)))
                  AND (qtkta.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                       (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear)))
            ))
        AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
       OR LOWER(TRIM(dv.TEN)) LIKE sT
       OR LOWER(TRIM(bm.TEN)) LIKE sT
       OR LOWER(ldt.TEN) like sT
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
                        qtkta.SO_QUYET_DINH AS "soQuyetDinh",
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
                    AND ((list_shcc IS NULL AND list_dv IS NULL)
                        OR ((qtkta.LOAI_DOI_TUONG = '02') AND
                            ((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkta.MA) != 0) OR (list_shcc = qtkta.MA)))
                            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0))))
                    AND ((
                            (fromYear IS NULL) AND (toYear IS NULL)
                        ) OR (
                              (qtkta.NAM_DAT_DUOC IS NOT NULL AND (fromYear IS NULL OR
                               (TO_NUMBER(qtkta.NAM_DAT_DUOC) >= fromYear)))
                              AND (qtkta.NAM_DAT_DUOC IS NOT NULL AND (toYear IS NULL OR
                                   (TO_NUMBER(qtkta.NAM_DAT_DUOC) <= toYear)))
                        ))
                    AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                   OR LOWER(TRIM(dv.TEN)) LIKE sT
                   OR LOWER(TRIM(bm.TEN)) LIKE sT
                   OR LOWER(ldt.TEN) like sT
                   OR LOWER(TRIM(ktct.TEN)) LIKE sT
                   OR LOWER(TRIM(ktkh.ten)) LIKE sT)
                ORDER BY qtkta.NAM_DAT_DUOC DESC, qtkta.ID DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_KY_LUAT_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER)
                                         RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtkl.ID           AS                "id",
                        qtkl.LY_DO_HINH_THUC    AS "lyDoHinhThuc",
                        qtkl.CAP_QUYET_DINH AS "capQuyetDinh",
                        qtkl.DIEM_THI_DUA   AS "diemThiDua",
                        qtkl.NOI_DUNG   AS "noiDung",
                        qtkl.NGAY_RA_QUYET_DINH AS "ngayRaQuyetDinh",
                        qtkl.SO_QUYET_DINH AS "soQuyetDinh",

                        today   as "today",
                        dmkl.TEN           AS   "tenKyLuat",
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",
                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_RA_QUYET_DINH DESC) R
                FROM QT_KY_LUAT qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkl.SHCC) != 0) OR (list_shcc = qtkl.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
                  AND (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
                 ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC
             );
    RETURN my_cursor;

END;
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
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = TO_CHAR(dv.MA))
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

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
                                 LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                        WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkl_temp.SHCC) != 0) OR (list_shcc = qtkl_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                          AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                           OR LOWER(dmkl.TEN) LIKE sT
                           OR LOWER(qtkl_temp.CAP_QUYET_DINH) LIKE sT
                           OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                        ) AS "soKyLuat",

                        (select rtrim(xmlagg(xmlelement(e, dmkl.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KY_LUAT qtkl_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                        WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkl_temp.SHCC) != 0) OR (list_shcc = qtkl_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                          AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                           OR LOWER(dmkl.TEN) LIKE sT
                           OR LOWER(qtkl_temp.CAP_QUYET_DINH) LIKE sT
                           OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                        ) AS "danhSachKyLuat",

                        (select rtrim(xmlagg(xmlelement(e, qtkl_temp.NGAY_RA_QUYET_DINH || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_KY_LUAT qtkl_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtkl_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_KY_LUAT dmkl ON qtkl_temp.LY_DO_HINH_THUC = dmkl.MA
                        WHERE (qtkl_temp.SHCC = qtkl.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkl_temp.SHCC) != 0) OR (list_shcc = qtkl_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (fromYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl_temp.NGAY_RA_QUYET_DINH >= fromYear))
                          AND (toYear IS NULL OR (qtkl_temp.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl_temp.NGAY_RA_QUYET_DINH <= toYear))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(qtkl_temp.NOI_DUNG) LIKE sT
                           OR LOWER(dmkl.TEN) LIKE sT
                           OR LOWER(qtkl_temp.CAP_QUYET_DINH) LIKE sT
                           OR LOWER(qtkl_temp.SO_QUYET_DINH) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                        ) AS "danhSachNgayRaQd",
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",
                        
                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",
                        
                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",
                        
                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",
                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC) R
                FROM (SELECT *
                        FROM QT_KY_LUAT
                        WHERE ID IN (
                            SELECT MAX(ID) FROM (SELECT * FROM QT_KY_LUAT ORDER BY SHCC DESC ) GROUP BY SHCC)) qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = TO_CHAR(dv.MA))
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                 ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC
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
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkl.SHCC) != 0) OR (list_shcc = qtkl.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (fromYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
      AND (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
      AND (searchTerm = ''
       OR LOWER(cb.SHCC) LIKE sT
       OR LOWER(qtkl.NOI_DUNG) LIKE sT
       OR LOWER(dmkl.TEN) LIKE sT
       OR LOWER(qtkl.CAP_QUYET_DINH) LIKE sT
       OR LOWER(qtkl.SO_QUYET_DINH) LIKE sT
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
                        qtkl.CAP_QUYET_DINH AS "capQuyetDinh",
                        qtkl.DIEM_THI_DUA   AS "diemThiDua",
                        qtkl.NOI_DUNG   AS "noiDung",
                        qtkl.NGAY_RA_QUYET_DINH AS "ngayRaQuyetDinh",
                        qtkl.SO_QUYET_DINH AS "soQuyetDinh",

                        dmkl.TEN           AS   "tenKyLuat",
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",
                        ROW_NUMBER() OVER (ORDER BY NGAY_RA_QUYET_DINH DESC) R
                FROM QT_KY_LUAT qtkl
                         LEFT JOIN TCHC_CAN_BO cb on qtkl.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_KY_LUAT dmkl ON qtkl.LY_DO_HINH_THUC = dmkl.MA
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtkl.SHCC) != 0) OR (list_shcc = qtkl.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (fromYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH >= fromYear))
                  AND (toYear IS NULL OR (qtkl.NGAY_RA_QUYET_DINH IS NOT NULL AND qtkl.NGAY_RA_QUYET_DINH <= toYear))))
                  AND (searchTerm = ''
                   OR LOWER(cb.SHCC) LIKE sT
                   OR LOWER(qtkl.NOI_DUNG) LIKE sT
                   OR LOWER(dmkl.TEN) LIKE sT
                   OR LOWER(qtkl.CAP_QUYET_DINH) LIKE sT
                   OR LOWER(qtkl.SO_QUYET_DINH) LIKE sT
                   OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT)
                 ORDER BY qtkl.NGAY_RA_QUYET_DINH DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LAM_VIEC_NGOAI_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_LAM_VIEC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LAM_VIEC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtlvn
             LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC;
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtlvn.ID           AS                "id",
                        qtlvn.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        (SELECT COUNT(*)
                        FROM QT_LAM_VIEC_NGOAI qtlvn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtlvn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtlvn_temp.SHCC = qtlvn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtlvn_temp.SHCC) != 0) OR (list_shcc = qtlvn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND ((qtlvn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtlvn_temp.BAT_DAU <= toYear)
                              )
                          AND (tinhTrang IS NULL OR ((qtlvn_temp.KET_THUC = -1 OR qtlvn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtlvn_temp.KET_THUC IS NOT NULL AND qtlvn_temp.KET_THUC != -1 AND qtlvn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtlvn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtlvn_temp.NOI_LAM_VIEC) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, qtlvn_temp.NOI_DUNG|| ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_LAM_VIEC_NGOAI qtlvn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtlvn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtlvn_temp.SHCC = qtlvn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtlvn_temp.SHCC) != 0) OR (list_shcc = qtlvn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND ((qtlvn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtlvn_temp.BAT_DAU <= toYear)
                              )
                          AND (tinhTrang IS NULL OR ((qtlvn_temp.KET_THUC = -1 OR qtlvn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtlvn_temp.KET_THUC IS NOT NULL AND qtlvn_temp.KET_THUC != -1 AND qtlvn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtlvn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtlvn_temp.NOI_LAM_VIEC) LIKE sT)
                        ) AS "danhSachNoiDung",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM (SELECT *
                      FROM QT_LAM_VIEC_NGOAI
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LAM_VIEC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtlvn
                         LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
                ORDER BY qtlvn.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LAM_VIEC_NGOAI_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                          list_shcc IN STRING, list_dv IN STRING,
                                          fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER,
                                          searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_LAM_VIEC_NGOAI qtlvn
             LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
            (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtlvn.SHCC) != 0) OR (list_shcc = qtlvn.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND ((qtlvn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR qtlvn.BAT_DAU <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((qtlvn.KET_THUC = -1 OR qtlvn.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qtlvn.KET_THUC IS NOT NULL AND qtlvn.KET_THUC != -1 AND qtlvn.KET_THUC < today AND tinhTrang = 1)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtlvn.NOI_DUNG) LIKE sT
        OR LOWER(qtlvn.NOI_LAM_VIEC) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtlvn.ID               AS                  "id",
                        qtlvn.NOI_DUNG         AS                  "noiDung",
                        qtlvn.NOI_LAM_VIEC         AS              "noiLamViec",
                        qtlvn.BAT_DAU          AS                  "batDau",
                        qtlvn.BAT_DAU_TYPE     AS                  "batDauType",
                        qtlvn.KET_THUC         AS                  "ketThuc",
                        qtlvn.KET_THUC_TYPE    AS                  "ketThucType",
                        qtlvn.SHCC             AS                  "shcc",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                 FROM QT_LAM_VIEC_NGOAI qtlvn
                          LEFT JOIN TCHC_CAN_BO cb on qtlvn.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                        (tinhTrang IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtlvn.SHCC) != 0) OR
                            (list_shcc = qtlvn.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (
                                     (qtlvn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtlvn.BAT_DAU >= fromYear)) AND
                                     (toYear IS NULL OR qtlvn.BAT_DAU <= toYear)
                             )
                         AND (tinhTrang IS NULL OR ((qtlvn.KET_THUC = -1 OR qtlvn.KET_THUC >= today) AND tinhTrang = 2) OR
                              (qtlvn.KET_THUC IS NOT NULL AND qtlvn.KET_THUC != -1 AND qtlvn.KET_THUC < today AND
                               tinhTrang = 1))))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(qtlvn.NOI_DUNG) LIKE sT
                     OR LOWER(qtlvn.NOI_LAM_VIEC) LIKE sT)
                 ORDER BY qtlvn.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_LUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtl
             LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC;

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
                        (SELECT COUNT(*)
                        FROM QT_LUONG qtl_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtl_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtl_temp.SHCC = qtl.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl_temp.SHCC) != 0) OR (list_shcc = qtl_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtl_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl_temp.BAT_DAU <= toYear)
                              ) OR (
                                timeType = 2 AND (qtl_temp.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl_temp.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl_temp.NGAY_HUONG <= toYear))
                                    ))
                          AND (tinhTrang IS NULL OR ((qtl_temp.KET_THUC = -1 OR qtl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtl_temp.KET_THUC IS NOT NULL AND qtl_temp.KET_THUC != -1 AND qtl_temp.KET_THUC < today AND tinhTrang = 1))))
                            AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtl_temp.CHUC_DANH_NGHE_NGHIEP) LIKE sT
                            OR LOWER(qtl_temp.SO_HIEU_VAN_BAN) LIKE sT)
                        ) AS "soNgayHuong",

                        (select rtrim(xmlagg(xmlelement(e, qtl_temp.NGAY_HUONG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_LUONG qtl_temp
                             LEFT JOIN TCHC_CAN_BO cb on qtl_temp.SHCC = cb.SHCC
                             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtl_temp.SHCC = qtl.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl_temp.SHCC) != 0) OR (list_shcc = qtl_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtl_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl_temp.BAT_DAU <= toYear)
                              ) OR (
                                timeType = 2 AND (qtl_temp.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl_temp.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl_temp.NGAY_HUONG <= toYear))
                                    ))
                          AND (tinhTrang IS NULL OR ((qtl_temp.KET_THUC = -1 OR qtl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtl_temp.KET_THUC IS NOT NULL AND qtl_temp.KET_THUC != -1 AND qtl_temp.KET_THUC < today AND tinhTrang = 1))))
                            AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtl_temp.CHUC_DANH_NGHE_NGHIEP) LIKE sT
                            OR LOWER(qtl_temp.SO_HIEU_VAN_BAN) LIKE sT)
                        ) AS "danhSachNgayHuong",
                        ROW_NUMBER() OVER (ORDER BY qtl.NGAY_HUONG DESC) R
                     FROM (SELECT *
                          FROM QT_LUONG
                          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtl
                                          LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
                ORDER BY qtl.NGAY_HUONG DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_LUONG qtl
             LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl.SHCC) != 0) OR (list_shcc = qtl.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0 OR (
            timeType = 1 AND (qtl.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl.BAT_DAU <= toYear)
          ) OR (
            timeType = 2 AND (qtl.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl.NGAY_HUONG <= toYear))
                ))
      AND (tinhTrang IS NULL OR ((qtl.KET_THUC = -1 OR qtl.KET_THUC >= today) AND tinhTrang = 2) OR
        (qtl.KET_THUC IS NOT NULL AND qtl.KET_THUC != -1 AND qtl.KET_THUC < today AND tinhTrang = 1))))
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

                        today   AS "today",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtl.NGAY_HUONG DESC) R
                 FROM QT_LUONG qtl
                          LEFT JOIN TCHC_CAN_BO cb on qtl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtl.SHCC) != 0) OR (list_shcc = qtl.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0 OR (
                        timeType = 1 AND (qtl.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtl.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtl.BAT_DAU <= toYear)
                      ) OR (
                        timeType = 2 AND (qtl.NGAY_HUONG IS NOT NULL AND (fromYear IS NULL OR qtl.NGAY_HUONG >= fromYear) AND (toYear IS NULL OR qtl.NGAY_HUONG <= toYear))
                            ))
                  AND (tinhTrang IS NULL OR ((qtl.KET_THUC = -1 OR qtl.KET_THUC >= today) AND tinhTrang = 2) OR
                    (qtl.KET_THUC IS NOT NULL AND qtl.KET_THUC != -1 AND qtl.KET_THUC < today AND tinhTrang = 1))))
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
    DON_VI      STRING(200) := SUBSTR(filter, INSTR(filter, '%', 1, 4) + 1,
                                      INSTR(filter, '%', 1, 5) - INSTR(filter, '%', 1, 4) - 1);
    MASOCB      STRING(200) := SUBSTR(filter, INSTR(filter, '%', 1, 5) + 1,
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
                                              connect by
                                                      regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level) is not null))
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
        OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
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
                                ((TO_CHAR(qtnckh.SHCC) IN
                                  (select regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level)
                                   from dual
                                   connect by regexp_substr(QT_NCKH_SEARCH_PAGE.MASOCB, '[^,]+', 1, level) is not null))
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
                     OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
                     OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
                 ORDER BY qtnckh.NGAY_NGHIEM_THU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_DOWNLOAD_EXCEL(maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                   fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                   maDonVi IN STRING) RETURN SYS_REFCURSOR
AS
    my_cursor   SYS_REFCURSOR;
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
                        qtnckh.IN_LLKH                                                  AS "inLLKH",
                        (select TEN FROM DM_TRINH_DO WHERE CB.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                 WHERE ((maSoCanBo IS NOT NULL AND INSTR(maSoCanBo, qtnckh.SHCC) != 0)
                     OR (maDonVi IS NOT NULL AND INSTR(maDonVi, cb.MA_DON_VI) != 0)
                     OR (loaiHocVi IS NOT NULL AND INSTR(loaiHocVi, cb.HOC_VI) != 0)
                     OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                    AND (timeType = 0 OR (timeType = 1 AND
                            (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
        AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
        OR ((timeType = 2) AND
                            (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
        AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
        OR ((timeType = 3) AND
                            (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
        AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear))))
                 ORDER BY qtnckh.BAT_DAU DESC NULLS LAST
             );
    RETURN my_cursor;
END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                  searchTerm IN STRING,
                                                  maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                  fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                  maDonVi IN STRING,
                                                  totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHIEN_CUU_KHOA_HOC
          WHERE ID IN
                (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC) GROUP BY SHCC)) qtnckh
             LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC;
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnckh.SHCC                                                    AS "shcc",
                        cb.HO                                                          AS "hoCanBo",
                        cb.TEN                                                         AS "tenCanBo",
                        (select TEN FROM DM_TRINH_DO WHERE cb.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",
                        (SELECT COUNT(*)
                         FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh_tmp
                                  LEFT JOIN TCHC_CAN_BO CB on qtnckh_tmp.SHCC = CB.SHCC
                         WHERE (qtnckh_tmp.SHCC = qtnckh.SHCC)
                           AND ((maSoCanBo IS NOT NULL AND INSTR(maSoCanBo, qtnckh_tmp.SHCC) != 0)
                             OR (maDonVi IS NOT NULL AND INSTR(maDonVi, cb.MA_DON_VI) != 0)
                             OR (loaiHocVi IS NOT NULL AND INSTR(loaiHocVi, cb.HOC_VI) != 0)
                             OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                           AND (timeType = 0 OR (timeType = 1 AND
                                                 (qtnckh_tmp.BAT_DAU IS NOT NULL AND
                                                  (fromYear IS NULL OR qtnckh_tmp.BAT_DAU >= fromYear))
                             AND (qtnckh_tmp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.BAT_DAU <= toYear)))
                             OR ((timeType = 2) AND
                                 (qtnckh_tmp.KET_THUC IS NOT NULL AND
                                  (fromYear IS NULL OR qtnckh_tmp.KET_THUC >= fromYear))
                                 AND (qtnckh_tmp.KET_THUC IS NOT NULL AND
                                      (toYear IS NULL OR qtnckh_tmp.KET_THUC <= toYear)))
                             OR ((timeType = 3) AND
                                 (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                                  (fromYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU >= fromYear))
                                 AND (qtnckh_tmp.NGAY_NGHIEM_THU IS NOT NULL AND
                                      (toYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU <= toYear)))
                             )
                           AND (searchTerm = ''
                             OR LOWER(CB.SHCC) LIKE sT
                             OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.TEN_DE_TAI)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.VAI_TRO)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.KET_QUA)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.MA_SO_CAP_QUAN_LY)) LIKE sT)
                        )                                                              AS "soDeTai",

                        (select rtrim(xmlagg(xmlelement(e, qtnckh_tmp.TEN_DE_TAI ||
                                                           CASE
                                                               WHEN (qtnckh_tmp.BAT_DAU IS NOT NULL)
                                                                   THEN ' (' || to_char(qtnckh_tmp.BAT_DAU / (1000 * 60 * 60 * 24) + + TO_DATE('1970-01-01 08:00:00', 'YYYY-MM-DD HH:MI:SS'), qtnckh_tmp.BAT_DAU_TYPE) || ') '
                                                               ELSE ' ' END, '??').extract('//text()') order by
                                             null).getclobval(), '??')
                         FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh_tmp
                                  LEFT JOIN TCHC_CAN_BO CB on qtnckh_tmp.SHCC = CB.SHCC
                         WHERE (qtnckh_tmp.SHCC = qtnckh.SHCC)
                           AND ((maSoCanBo IS NOT NULL AND INSTR(maSoCanBo, qtnckh_tmp.SHCC) != 0)
                             OR (maDonVi IS NOT NULL AND INSTR(maDonVi, cb.MA_DON_VI) != 0)
                             OR (loaiHocVi IS NOT NULL AND INSTR(loaiHocVi, cb.HOC_VI) != 0)
                             OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                           AND (timeType = 0 OR (timeType = 1 AND
                                                 (qtnckh_tmp.BAT_DAU IS NOT NULL AND
                                                  (fromYear IS NULL OR qtnckh_tmp.BAT_DAU >= fromYear))
                             AND (qtnckh_tmp.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh_tmp.BAT_DAU <= toYear)))
                             OR ((timeType = 2) AND
                                 (fromYear IS NULL OR qtnckh_tmp.KET_THUC IS NULL OR qtnckh_tmp.KET_THUC >= fromYear)
                                 AND (toYear IS NULL OR qtnckh_tmp.KET_THUC IS NULL OR qtnckh_tmp.KET_THUC <= toYear))
                             OR ((timeType = 3) AND
                                 (fromYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU IS NULL OR
                                  qtnckh_tmp.NGAY_NGHIEM_THU >= fromYear)
                                 AND (toYear IS NULL OR qtnckh_tmp.NGAY_NGHIEM_THU IS NULL OR
                                      qtnckh_tmp.NGAY_NGHIEM_THU <= toYear))
                             )
                           AND (searchTerm = ''
                             OR LOWER(CB.SHCC) LIKE sT
                             OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.TEN_DE_TAI)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.VAI_TRO)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.KET_QUA)) LIKE sT
                             OR LOWER(TRIM(qtnckh_tmp.MA_SO_CAP_QUAN_LY)) LIKE sT))    AS "danhSachDeTai",
                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM (SELECT *
                       FROM QT_NGHIEN_CUU_KHOA_HOC
                       WHERE ID IN
                             (SELECT MAX(ID)
                              FROM (SELECT * FROM QT_NGHIEN_CUU_KHOA_HOC ORDER BY SHCC DESC)
                              GROUP BY SHCC)) qtnckh
                          LEFT JOIN TCHC_CAN_BO cb on qtnckh.SHCC = cb.SHCC
                 ORDER BY qtnckh.BAT_DAU DESC NULLS LAST
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHIEN_CUU_KHOA_HOC_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                                   searchTerm IN STRING,
                                                   maSoCanBo IN STRING, loaiHocVi IN STRING,
                                                   fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER,
                                                   maDonVi IN STRING,
                                                   totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
             LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
    WHERE ((maSoCanBo IS NOT NULL AND INSTR(maSoCanBo, qtnckh.SHCC) != 0)
        OR (maDonVi IS NOT NULL AND INSTR(maDonVi, cb.MA_DON_VI) != 0)
        OR (loaiHocVi IS NOT NULL AND INSTR(loaiHocVi, cb.HOC_VI) != 0)
        OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
      AND (timeType = 0 OR (timeType = 1 AND
                            (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
        AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
        OR ((timeType = 2) AND
                            (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
        AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
        OR ((timeType = 3) AND
                            (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
        AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear)))
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE sT
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
        OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
        OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
        OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
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
                        qtnckh.IN_LLKH                                                  AS "inLLKH",
                        (select TEN FROM DM_TRINH_DO WHERE CB.HOC_VI = DM_TRINH_DO.MA) AS "hocViCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC)                              R
                 FROM QT_NGHIEN_CUU_KHOA_HOC qtnckh
                          LEFT JOIN TCHC_CAN_BO CB on qtnckh.SHCC = CB.SHCC
                 WHERE ((maSoCanBo IS NOT NULL AND INSTR(maSoCanBo, qtnckh.SHCC) != 0)
                     OR (maDonVi IS NOT NULL AND INSTR(maDonVi, cb.MA_DON_VI) != 0)
                     OR (loaiHocVi IS NOT NULL AND INSTR(loaiHocVi, cb.HOC_VI) != 0)
                     OR (maSoCanBo IS NULL AND maDonVi IS NULL AND loaiHocVi IS NULL))
                    AND (timeType = 0 OR (timeType = 1 AND
                            (qtnckh.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnckh.BAT_DAU >= fromYear))
        AND (qtnckh.BAT_DAU IS NOT NULL AND (toYear IS NULL OR qtnckh.BAT_DAU <= toYear)))
        OR ((timeType = 2) AND
                            (qtnckh.KET_THUC IS NOT NULL AND (fromYear IS NULL OR qtnckh.KET_THUC >= fromYear))
        AND (qtnckh.KET_THUC IS NOT NULL AND (toYear IS NULL OR qtnckh.KET_THUC <= toYear)))
        OR ((timeType = 3) AND
                            (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (fromYear IS NULL OR qtnckh.NGAY_NGHIEM_THU >= fromYear))
        AND (qtnckh.NGAY_NGHIEM_THU IS NOT NULL AND (toYear IS NULL OR qtnckh.NGAY_NGHIEM_THU <= toYear))))
                   AND (searchTerm = ''
                     OR LOWER(CB.SHCC) LIKE sT
                     OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE sT
                     OR LOWER(TRIM(qtnckh.TEN_DE_TAI)) LIKE sT
                     OR LOWER(TRIM(qtnckh.VAI_TRO)) LIKE sT
                     OR LOWER(TRIM(qtnckh.KET_QUA)) LIKE sT
                     OR LOWER(TRIM(qtnckh.MA_SO_CAP_QUAN_LY)) LIKE sT)
                 ORDER BY qtnckh.BAT_DAU DESC NULLS LAST
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

CREATE OR REPLACE FUNCTION QT_NGHI_KHONG_LUONG_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_KHONG_LUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_KHONG_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtnkl
             LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnkl.ID            AS                       "id",
                        qtnkl.SHCC          AS                       "shcc",

                        qtnkl.HO            AS                       "ho",
                        qtnkl.TEN           AS                       "ten",
                        
                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        (SELECT COUNT(*)
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "soLanNghi",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsBatDauType",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qtnkl_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_KHONG_LUONG qtnkl_temp
                         WHERE qtnkl_temp.SHCC = qtnkl.SHCC
                            AND (timeType = 0 OR (timeType = 1
                               AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                               OR (timeType = 2 AND
                               (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_DI_LAM)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_DI_LAM))
                                   OR (timeType = 3 AND
                                    (fromYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)
                                AND (toYear IS NULL OR qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl_temp.THOI_GIAN_TRO_LAI_CONG_TAC)))
                               AND (tinhTrang IS NULL OR ((qtnkl_temp.KET_THUC = -1 OR qtnkl_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnkl_temp.KET_THUC IS NOT NULL AND qtnkl_temp.KET_THUC != -1 AND qtnkl_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "dsKetThucType",

                        ROW_NUMBER() OVER (ORDER BY qtnkl.BAT_DAU DESC) R
                     FROM (SELECT *
          FROM QT_NGHI_KHONG_LUONG
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_KHONG_LUONG ORDER BY SHCC DESC) GROUP BY SHCC)) qtnkl
                          LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                       AND (timeType = 0 OR (timeType = 1
                       AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                       AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
                       OR (timeType = 2 AND
                       (fromYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl.THOI_GIAN_DI_LAM)
                        AND (toYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl.THOI_GIAN_DI_LAM))
                           OR (timeType = 3 AND
                            (fromYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)
                        AND (toYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)))
                       AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
                                 (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1))
                  AND (searchTerm = ''
                        OR LOWER(cb.SHCC) LIKE sT
                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                        OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
                        OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
                        OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
                        OR LOWER(qtnkl.GHI_CHU) LIKE sT)
                 ORDER BY qtnkl.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_KHONG_LUONG_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER, timeType IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_KHONG_LUONG qtnkl
             LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
     WHERE (((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
       AND (timeType = 0 OR (timeType = 1
       AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
       AND (toYear IS NULL OR qtnkl.KET_THUC IS NULL OR qtnkl.KET_THUC <= toYear))
       OR (timeType = 2 AND
       (fromYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR fromYear <= qtnkl.THOI_GIAN_DI_LAM)
        AND (toYear IS NULL OR qtnkl.THOI_GIAN_DI_LAM IS NULL OR toYear >= qtnkl.THOI_GIAN_DI_LAM))
           OR (timeType = 3 AND
            (fromYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR fromYear <= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)
        AND (toYear IS NULL OR qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC IS NULL OR toYear >= qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC)))
       AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1)))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
        OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
        OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
        OR LOWER(qtnkl.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnkl.ID            AS                       "id",
                        qtnkl.HO            AS                       "ho",
                        qtnkl.TEN           AS                       "ten",
                        qtnkl.SHCC          AS                       "shcc",
                        qtnkl.TEMP          AS                       "temp",
                        qtnkl.SO_VAN_BAN       AS                       "soVanBan",
                        qtnkl.THOI_GIAN_DI_LAM                  AS            "thoiGianDiLam",
                        qtnkl.GHI_CHU            AS                  "ghiChu",
                        qtnkl.SO_THONG_BAO     AS                "soThongBao",
                        qtnkl.TONG_THOI_GIAN     AS              "tongThoiGian",
                        qtnkl.BAT_DAU                AS              "batDau",
                        qtnkl.BAT_DAU_TYPE           AS              "batDauType",
                        qtnkl.KET_THUC               AS              "ketThuc",
                        qtnkl.KET_THUC_TYPE          AS              "ketThucType",
                        qtnkl.THOI_GIAN_TRO_LAI_CONG_TAC               AS             "thoiGianTroLaiCongTac",
                        qtnkl.THONG_BAO_SO           AS               "thongBaoSo",
                        qtnkl.THAM_GIA_BHXH          AS                 "thamGiaBHXH",
                        qtnkl.THOI_GIAN_BAO_GIAM     AS                 "thoiGianBaoGiam",
                        qtnkl.THOI_GIAN_BAO_TANG     AS                 "thoiGianBaoTang",

                        today                       AS              "today",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtnkl.BAT_DAU DESC) R
                 FROM QT_NGHI_KHONG_LUONG qtnkl
                          LEFT JOIN TCHC_CAN_BO cb on qtnkl.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                  WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnkl.SHCC) != 0)
                      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                      OR (list_shcc IS NULL AND list_dv IS NULL))
                       AND (fromYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU >= fromYear)
                       AND (toYear IS NULL OR qtnkl.BAT_DAU IS NULL OR qtnkl.BAT_DAU <= toYear)
                    AND (tinhTrang IS NULL OR ((qtnkl.KET_THUC = -1 OR qtnkl.KET_THUC >= today) AND tinhTrang = 2) OR
                        (qtnkl.KET_THUC IS NOT NULL AND qtnkl.KET_THUC != -1 AND qtnkl.KET_THUC < today AND tinhTrang = 1))
                      AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtnkl.SO_VAN_BAN) LIKE sT
                            OR LOWER(qtnkl.SO_THONG_BAO) LIKE sT
                            OR LOWER(qtnkl.THONG_BAO_SO) LIKE sT
                            OR LOWER(qtnkl.GHI_CHU) LIKE sT)
                 ORDER BY qtnkl.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_PHEP
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_PHEP ORDER BY SHCC DESC) GROUP BY SHCC)) qtnp
             LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnp.ID            AS                       "id",
                        qtnp.SHCC          AS                       "shcc",

                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        (SELECT COUNT(*)
                         FROM QT_NGHI_PHEP qtnp_temp
                         WHERE qtnp_temp.SHCC = qtnp.SHCC
                            AND (fromYear IS NULL OR qtnp_temp.BAT_DAU IS NULL OR qtnp_temp.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnp_temp.KET_THUC IS NULL OR qtnp_temp.KET_THUC <= toYear)
                            AND (tinhTrang IS NULL OR ((qtnp_temp.KET_THUC = -1 OR qtnp_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnp_temp.KET_THUC IS NOT NULL AND qtnp_temp.KET_THUC != -1 AND qtnp_temp.KET_THUC < today AND tinhTrang = 1))
                        ) AS "soLanNghi",

                        (select rtrim(xmlagg(xmlelement(e, qtnp_temp3.LY_DO_NGHI || ' ','??').extract('//text()') order by null).getclobval(),'??')
                         FROM QT_NGHI_PHEP qtnp_temp3
                         WHERE qtnp_temp3.SHCC = qtnp.SHCC
                            AND (fromYear IS NULL OR qtnp_temp3.BAT_DAU IS NULL OR qtnp_temp3.BAT_DAU >= fromYear)
                            AND (toYear IS NULL OR qtnp_temp3.KET_THUC IS NULL OR qtnp_temp3.KET_THUC <= toYear)
                            AND (tinhTrang IS NULL OR ((qtnp_temp3.KET_THUC = -1 OR qtnp_temp3.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnp_temp3.KET_THUC IS NOT NULL AND qtnp_temp3.KET_THUC != -1 AND qtnp_temp3.KET_THUC < today AND tinhTrang = 1))
                        ) AS "danhSachLyDoNghi",
                        ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
                     FROM (SELECT *
          FROM QT_NGHI_PHEP
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_PHEP ORDER BY SHCC DESC) GROUP BY SHCC)) qtnp
                          LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnp.SHCC) != 0)
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                   AND (fromYear IS NULL OR qtnp.BAT_DAU IS NULL OR qtnp.BAT_DAU >= fromYear)
                   AND (toYear IS NULL OR qtnp.KET_THUC IS NULL OR qtnp.KET_THUC <= toYear)
                   AND (tinhTrang IS NULL OR ((qtnp.KET_THUC = -1 OR qtnp.KET_THUC >= today) AND tinhTrang = 2) OR
                    (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC != -1 AND qtnp.KET_THUC < today AND tinhTrang = 1))
                  AND (searchTerm = ''
                        OR LOWER(cb.SHCC) LIKE sT
                        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                        OR LOWER(qtnp.LY_DO_NGHI) LIKE sT
                        OR LOWER(qtnp.NOI_DEN) LIKE sT
                        OR LOWER(qtnp.GHI_CHU) LIKE sT)
                 ORDER BY qtnp.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_PHEP_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_PHEP qtnp
             LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
     WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnp.SHCC) != 0)
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
       AND (fromYear IS NULL OR qtnp.BAT_DAU IS NULL OR qtnp.BAT_DAU >= fromYear)
       AND (toYear IS NULL OR qtnp.KET_THUC IS NULL OR qtnp.KET_THUC <= toYear)
       AND (tinhTrang IS NULL OR ((qtnp.KET_THUC = -1 OR qtnp.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC != -1 AND qtnp.KET_THUC < today AND tinhTrang = 1))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtnp.LY_DO_NGHI) LIKE sT
        OR LOWER(qtnp.NOI_DEN) LIKE sT
        OR LOWER(qtnp.GHI_CHU) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnp.ID            AS                       "id",
                        qtnp.SHCC          AS                       "shcc",
                        qtnp.LY_DO_NGHI    AS                       "lyDoNghi",
                        qtnp.NOI_DEN       AS                       "noiDen",
                        qtnp.TONG_NGAY_DUOC_NGHI      AS            "tongNgayDuocNghi",
                        qtnp.GHI_CHU            AS                  "ghiChu",
                        qtnp.SO_NGAY_XIN_NGHI     AS                "soNgayXinNghi",
                        qtnp.SO_NGAY_TINH_PHEP      AS              "soNgayTinhPhep",
                        qtnp.BAT_DAU                AS              "batDau",
                        qtnp.BAT_DAU_TYPE           AS              "batDauType",
                        qtnp.KET_THUC               AS              "ketThuc",
                        qtnp.KET_THUC_TYPE          AS              "ketThucType",
                        qtnp.THAM_NIEN               AS             "thamNien",

                        today                       AS              "today",
                        
                        cb.HO              AS                       "hoCanBo",
                        cb.TEN             AS                       "tenCanBo",

                        dv.MA              AS                       "maDonVi",
                        dv.TEN             AS                       "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY qtnp.BAT_DAU DESC) R
                 FROM QT_NGHI_PHEP qtnp
                          LEFT JOIN TCHC_CAN_BO cb on qtnp.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                  WHERE ((list_shcc IS NOT NULL AND INSTR(list_shcc, qtnp.SHCC) != 0)
                              OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                              OR (list_shcc IS NULL AND list_dv IS NULL))
                               AND (fromYear IS NULL OR qtnp.BAT_DAU IS NULL OR qtnp.BAT_DAU >= fromYear)
                               AND (toYear IS NULL OR qtnp.KET_THUC IS NULL OR qtnp.KET_THUC <= toYear)
                               AND (tinhTrang IS NULL OR ((qtnp.KET_THUC = -1 OR qtnp.KET_THUC >= today) AND tinhTrang = 2) OR
                                         (qtnp.KET_THUC IS NOT NULL AND qtnp.KET_THUC != -1 AND qtnp.KET_THUC < today AND tinhTrang = 1))
                      AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE sT
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                            OR LOWER(qtnp.LY_DO_NGHI) LIKE sT
                            OR LOWER(qtnp.NOI_DEN) LIKE sT
                            OR LOWER(qtnp.GHI_CHU) LIKE sT)
                 ORDER BY qtnp.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_DOWNLOAD_EXCEL(list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnts.ID    AS "id",
                        qtnts.SHCC  AS "shcc",
                        qtnts.NOI_DUNG  AS "noiDung",
                        qtnts.BAT_DAU   AS "batDau",
                        qtnts.BAT_DAU_TYPE   AS "batDauType",
                        qtnts.KET_THUC   AS "ketThuc",
                        qtnts.KET_THUC_TYPE   AS "ketThucType",
                        qtnts.TRO_LAI_CONG_TAC  AS "troLaiCongTac",

                        today   AS "today",

                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
                FROM QT_NGHI_THAI_SAN qtnts
                         LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts.SHCC) != 0) OR (list_shcc = qtnts.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0
                        OR (timeType = 1 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                        OR (timeType = 2 AND (qtnts.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts.TRO_LAI_CONG_TAC <= toYear)))
                  AND (tinhTrang IS NULL OR ((qtnts.KET_THUC = -1 OR qtnts.KET_THUC >= today) AND tinhTrang = 2) OR
                    (qtnts.KET_THUC IS NOT NULL AND qtnts.KET_THUC != -1 AND qtnts.KET_THUC < today AND tinhTrang = 1))))
                ORDER BY qtnts.BAT_DAU DESC
             );
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    ST        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM (SELECT *
          FROM QT_NGHI_THAI_SAN
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT
                        qtnts.SHCC                        AS      "shcc",

                        (SELECT COUNT(*)
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts_temp.SHCC) != 0) OR (list_shcc = qtnts_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0
                                OR (timeType = 1 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 2 AND (qtnts_temp.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC <= toYear)))
                          AND (tinhTrang IS NULL OR ((qtnts_temp.KET_THUC = -1 OR qtnts_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnts_temp.KET_THUC IS NOT NULL AND qtnts_temp.KET_THUC != -1 AND qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "soLanNghi",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.NOI_DUNG || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts_temp.SHCC) != 0) OR (list_shcc = qtnts_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0
                                OR (timeType = 1 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 2 AND (qtnts_temp.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC <= toYear)))
                          AND (tinhTrang IS NULL OR ((qtnts_temp.KET_THUC = -1 OR qtnts_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnts_temp.KET_THUC IS NOT NULL AND qtnts_temp.KET_THUC != -1 AND qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachNoiDung",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts_temp.SHCC) != 0) OR (list_shcc = qtnts_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0
                                OR (timeType = 1 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 2 AND (qtnts_temp.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC <= toYear)))
                          AND (tinhTrang IS NULL OR ((qtnts_temp.KET_THUC = -1 OR qtnts_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnts_temp.KET_THUC IS NOT NULL AND qtnts_temp.KET_THUC != -1 AND qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts_temp.SHCC) != 0) OR (list_shcc = qtnts_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0
                                OR (timeType = 1 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 2 AND (qtnts_temp.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC <= toYear)))
                          AND (tinhTrang IS NULL OR ((qtnts_temp.KET_THUC = -1 OR qtnts_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnts_temp.KET_THUC IS NOT NULL AND qtnts_temp.KET_THUC != -1 AND qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts_temp.SHCC) != 0) OR (list_shcc = qtnts_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0
                                OR (timeType = 1 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 2 AND (qtnts_temp.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC <= toYear)))
                          AND (tinhTrang IS NULL OR ((qtnts_temp.KET_THUC = -1 OR qtnts_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnts_temp.KET_THUC IS NOT NULL AND qtnts_temp.KET_THUC != -1 AND qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, qtnts_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NGHI_THAI_SAN qtnts_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnts_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                                 LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                                 LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                                 LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                        WHERE (qtnts_temp.SHCC = qtnts.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts_temp.SHCC) != 0) OR (list_shcc = qtnts_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0
                                OR (timeType = 1 AND (qtnts_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts_temp.BAT_DAU <= toYear))
                                OR (timeType = 2 AND (qtnts_temp.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts_temp.TRO_LAI_CONG_TAC <= toYear)))
                          AND (tinhTrang IS NULL OR ((qtnts_temp.KET_THUC = -1 OR qtnts_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnts_temp.KET_THUC IS NOT NULL AND qtnts_temp.KET_THUC != -1 AND qtnts_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                            OR LOWER(cb.SHCC) LIKE ST
                            OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                            OR LOWER(qtnts_temp.NOI_DUNG) LIKE ST)
                        ) AS "danhSachBatDauType",
                        
                        today   AS "today",
                        
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
                FROM (SELECT *
                      FROM QT_NGHI_THAI_SAN
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NGHI_THAI_SAN ORDER BY SHCC DESC) GROUP BY SHCC)) qtnts
                         LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                    ORDER BY qtnts.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_THAI_SAN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NGHI_THAI_SAN qtnts
             LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
             LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
             LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
             LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts.SHCC) != 0) OR (list_shcc = qtnts.SHCC)))
      OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
      OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (timeType = 0
            OR (timeType = 1 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
            OR (timeType = 2 AND (qtnts.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts.TRO_LAI_CONG_TAC <= toYear)))
      AND (tinhTrang IS NULL OR ((qtnts.KET_THUC = -1 OR qtnts.KET_THUC >= today) AND tinhTrang = 2) OR
        (qtnts.KET_THUC IS NOT NULL AND qtnts.KET_THUC != -1 AND qtnts.KET_THUC < today AND tinhTrang = 1))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE ST
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
        OR LOWER(qtnts.NOI_DUNG) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnts.ID    AS "id",
                        qtnts.SHCC  AS "shcc",
                        qtnts.NOI_DUNG  AS "noiDung",
                        qtnts.BAT_DAU   AS "batDau",
                        qtnts.BAT_DAU_TYPE   AS "batDauType",
                        qtnts.KET_THUC   AS "ketThuc",
                        qtnts.KET_THUC_TYPE   AS "ketThucType",
                        qtnts.TRO_LAI_CONG_TAC  AS "troLaiCongTac",
                        
                        today   AS "today",
                        
                        cb.SHCC            AS                "maCanBo",
                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        dv.MA              AS                "maDonVi",
                        dv.TEN             AS                "tenDonVi",

                        cv.MA   AS "maChucVu",
                        cv.TEN  AS "tenChucVu",

                        td.MA   AS "maHocVi",
                        td.TEN  AS "tenHocVi",

                        cdnn.MA AS "maChucDanhNgheNghiep",
                        cdnn.TEN AS "tenChucDanhNgheNghiep",

                        ROW_NUMBER() OVER (ORDER BY qtnts.BAT_DAU DESC) R
                FROM QT_NGHI_THAI_SAN qtnts
                         LEFT JOIN TCHC_CAN_BO cb on qtnts.SHCC = cb.SHCC
                         LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                         LEFT JOIN DM_CHUC_VU cv ON (cb.MA_CHUC_VU = cv.MA)
                         LEFT JOIN DM_TRINH_DO td ON (cb.HOC_VI = td.MA)
                         LEFT JOIN DM_NGACH_CDNN cdnn ON (cdnn.MA = cb.NGACH)
                WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                    OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnts.SHCC) != 0) OR (list_shcc = qtnts.SHCC)))
                  OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                  OR (list_shcc IS NULL AND list_dv IS NULL))
                  AND (timeType = 0
                        OR (timeType = 1 AND (qtnts.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnts.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnts.BAT_DAU <= toYear))
                        OR (timeType = 2 AND (qtnts.TRO_LAI_CONG_TAC IS NOT NULL AND (fromYear IS NULL OR qtnts.TRO_LAI_CONG_TAC >= fromYear)) AND (toYear IS NULL OR qtnts.TRO_LAI_CONG_TAC <= toYear)))
                  AND (tinhTrang IS NULL OR ((qtnts.KET_THUC = -1 OR qtnts.KET_THUC >= today) AND tinhTrang = 2) OR
                    (qtnts.KET_THUC IS NOT NULL AND qtnts.KET_THUC != -1 AND qtnts.KET_THUC < today AND tinhTrang = 1))))
                  AND (searchTerm = ''
                    OR LOWER(cb.SHCC) LIKE ST
                    OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE ST
                    OR LOWER(qtnts.NOI_DUNG) LIKE ST)
                ORDER BY qtnts.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_NGHI_VIEC_GROUP_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                        list_shcc IN STRING, list_dv IN STRING,
                                        fromYear IN NUMBER, toYear IN NUMBER, dienNghi IN NUMBER, searchTerm IN STRING,
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
      AND (dienNghi IS NULL OR (dienNghi = qtnv.DIEN_NGHI))
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
                            AND (fromYear IS NULL OR qtnv_temp.NGAY_NGHI IS NULL OR qtnv_temp.NGAY_NGHI >= fromYear)
                            AND (toYear IS NULL OR qtnv_temp.NGAY_NGHI IS NULL OR qtnv_temp.NGAY_NGHI <= toYear)
                            AND (dienNghi IS NULL OR (dienNghi = qtnv_temp.DIEN_NGHI))
                        ) AS "soLanNghi",
                        (Select listagg(qtnv_temp3.NOI_DUNG || ' ', '??') within group ( order by null)
                         FROM QT_NGHI_VIEC qtnv_temp3
                         WHERE qtnv_temp3.SHCC = qtnv.SHCC
                            AND (fromYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI >= fromYear)
                            AND (toYear IS NULL OR qtnv.NGAY_NGHI IS NULL OR qtnv.NGAY_NGHI <= toYear)
                            AND (dienNghi IS NULL OR (dienNghi = qtnv_temp3.DIEN_NGHI))
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
                   AND (dienNghi IS NULL OR (dienNghi = qtnv.DIEN_NGHI))
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
                                        fromYear IN NUMBER, toYear IN NUMBER, dienNghi IN NUMBER, searchTerm IN STRING,
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
       AND (dienNghi IS NULL OR (dienNghi = qtnv.DIEN_NGHI))
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
                       AND (dienNghi IS NULL OR (dienNghi = qtnv.DIEN_NGHI))
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
                                        fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER, searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today   NUMBER;
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem
    FROM (SELECT *
          FROM QT_NUOC_NGOAI
          WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtnn
             LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC;
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtnn.ID           AS                "id",
                        qtnn.SHCC            AS                "shcc",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        (SELECT COUNT(*)
                        FROM QT_NUOC_NGOAI qtnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtnn_temp.SHCC = qtnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn_temp.SHCC) != 0) OR (list_shcc = qtnn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtnn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnn_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((qtnn_temp.KET_THUC = -1 OR qtnn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnn_temp.KET_THUC IS NOT NULL AND qtnn_temp.KET_THUC != -1 AND qtnn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtnn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtnn_temp.TEN_CO_SO) LIKE sT)
                        ) AS "soQuaTrinh",

                        (select rtrim(xmlagg(xmlelement(e, qtnn_temp.BAT_DAU || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NUOC_NGOAI qtnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtnn_temp.SHCC = qtnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn_temp.SHCC) != 0) OR (list_shcc = qtnn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtnn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnn_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((qtnn_temp.KET_THUC = -1 OR qtnn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnn_temp.KET_THUC IS NOT NULL AND qtnn_temp.KET_THUC != -1 AND qtnn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtnn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtnn_temp.TEN_CO_SO) LIKE sT)
                        ) AS "danhSachBatDau",

                        (select rtrim(xmlagg(xmlelement(e, qtnn_temp.KET_THUC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NUOC_NGOAI qtnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtnn_temp.SHCC = qtnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn_temp.SHCC) != 0) OR (list_shcc = qtnn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtnn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnn_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((qtnn_temp.KET_THUC = -1 OR qtnn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnn_temp.KET_THUC IS NOT NULL AND qtnn_temp.KET_THUC != -1 AND qtnn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtnn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtnn_temp.TEN_CO_SO) LIKE sT)
                        ) AS "danhSachKetThuc",

                        (select rtrim(xmlagg(xmlelement(e, qtnn_temp.KET_THUC_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NUOC_NGOAI qtnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtnn_temp.SHCC = qtnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn_temp.SHCC) != 0) OR (list_shcc = qtnn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtnn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnn_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((qtnn_temp.KET_THUC = -1 OR qtnn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnn_temp.KET_THUC IS NOT NULL AND qtnn_temp.KET_THUC != -1 AND qtnn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtnn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtnn_temp.TEN_CO_SO) LIKE sT)
                        ) AS "danhSachKetThucType",

                        (select rtrim(xmlagg(xmlelement(e, qtnn_temp.BAT_DAU_TYPE || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NUOC_NGOAI qtnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtnn_temp.SHCC = qtnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn_temp.SHCC) != 0) OR (list_shcc = qtnn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtnn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnn_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((qtnn_temp.KET_THUC = -1 OR qtnn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnn_temp.KET_THUC IS NOT NULL AND qtnn_temp.KET_THUC != -1 AND qtnn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtnn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtnn_temp.TEN_CO_SO) LIKE sT)
                        ) AS "danhSachBatDauType",

                        (select rtrim(xmlagg(xmlelement(e, qtnn_temp.TRO_LAI_CONG_TAC || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM QT_NUOC_NGOAI qtnn_temp
                                 LEFT JOIN TCHC_CAN_BO cb on qtnn_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (qtnn_temp.SHCC = qtnn.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND (tinhTrang IS NULL))
                            OR (((list_shcc IS NOT NULL AND ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn_temp.SHCC) != 0) OR (list_shcc = qtnn_temp.SHCC)))
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (timeType = 0 OR (
                                timeType = 1 AND (qtnn_temp.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn_temp.BAT_DAU >= fromYear)) AND (toYear IS NULL OR qtnn_temp.BAT_DAU <= toYear)
                              ))
                          AND (tinhTrang IS NULL OR ((qtnn_temp.KET_THUC = -1 OR qtnn_temp.KET_THUC >= today) AND tinhTrang = 2) OR
                            (qtnn_temp.KET_THUC IS NOT NULL AND qtnn_temp.KET_THUC != -1 AND qtnn_temp.KET_THUC < today AND tinhTrang = 1))))
                          AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(qtnn_temp.NOI_DUNG) LIKE sT
                           OR LOWER(qtnn_temp.TEN_CO_SO) LIKE sT)
                        ) AS "danhSachTroLaiCongTac",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                FROM (SELECT *
                      FROM QT_NUOC_NGOAI
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM QT_NUOC_NGOAI ORDER BY SHCC DESC) GROUP BY SHCC)) qtnn
                         LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
                ORDER BY qtnn.BAT_DAU DESC
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
                                          fromYear IN NUMBER, toYear IN NUMBER, timeType IN NUMBER, tinhTrang IN NUMBER,
                                          searchTerm IN STRING,
                                          totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_NUOC_NGOAI qtnn
             LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND (timeType = 0) AND
            (tinhTrang IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn.SHCC) != 0) OR (list_shcc = qtnn.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (timeType = 0 OR (
                        timeType = 1 AND
                        (qtnn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn.BAT_DAU >= fromYear)) AND
                        (toYear IS NULL OR qtnn.BAT_DAU <= toYear)
                ))
            AND (tinhTrang IS NULL OR ((qtnn.KET_THUC = -1 OR qtnn.KET_THUC >= today) AND tinhTrang = 2) OR
                 (qtnn.KET_THUC IS NOT NULL AND qtnn.KET_THUC != -1 AND qtnn.KET_THUC < today AND tinhTrang = 1))))
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
                 SELECT qtnn.ID               AS                  "id",
                        qtnn.NOI_DUNG         AS                  "noiDung",
                        qtnn.QUOC_GIA         AS                  "quocGia",
                        qtnn.TEN_CO_SO        AS                  "tenCoSo",
                        qtnn.KINH_PHI         AS                  "kinhPhi",
                        qtnn.TRO_LAI_CONG_TAC AS                  "troLaiCongTac",
                        qtnn.BAT_DAU          AS                  "batDau",
                        qtnn.BAT_DAU_TYPE     AS                  "batDauType",
                        qtnn.KET_THUC         AS                  "ketThuc",
                        qtnn.KET_THUC_TYPE    AS                  "ketThucType",
                        qtnn.SHCC             AS                  "shcc",

                        today                 AS                  "today",
                        cb.HO                 AS                  "hoCanBo",
                        cb.TEN                AS                  "tenCanBo",

                        dv.MA                 AS                  "maDonVi",
                        dv.TEN                AS                  "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY BAT_DAU DESC) R
                 FROM QT_NUOC_NGOAI qtnn
                          LEFT JOIN TCHC_CAN_BO cb on qtnn.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL) AND
                         (timeType = 0) AND (tinhTrang IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtnn.SHCC) != 0) OR
                            (list_shcc = qtnn.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (timeType = 0 OR (
                                     timeType = 1 AND
                                     (qtnn.BAT_DAU IS NOT NULL AND (fromYear IS NULL OR qtnn.BAT_DAU >= fromYear)) AND
                                     (toYear IS NULL OR qtnn.BAT_DAU <= toYear)
                             ))
                         AND (tinhTrang IS NULL OR ((qtnn.KET_THUC = -1 OR qtnn.KET_THUC >= today) AND tinhTrang = 2) OR
                              (qtnn.KET_THUC IS NOT NULL AND qtnn.KET_THUC != -1 AND qtnn.KET_THUC < today AND
                               tinhTrang = 1))))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(qtnn.NOI_DUNG) LIKE sT
                     OR LOWER(qtnn.TEN_CO_SO) LIKE sT)
                 ORDER BY qtnn.BAT_DAU DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION QT_SANG_KIEN_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER,
                                         list_shcc IN STRING, list_dv IN STRING,
                                         searchTerm IN STRING,
                                         totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    sT        STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem

    FROM QT_SANG_KIEN qtsk
             LEFT JOIN TCHC_CAN_BO cb on qtsk.SHCC = cb.SHCC
             LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL))
        OR (list_shcc IS NOT NULL AND
            ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtsk.SHCC) != 0) OR (list_shcc = qtsk.SHCC)))
        OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
        OR (list_shcc IS NULL AND list_dv IS NULL))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(qtsk.MA_SO) LIKE sT
        OR LOWER(qtsk.TEN_SANG_KIEN) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT qtsk.ID                        AS    "id",
                        qtsk.SHCC                      AS    "shcc",
                        qtsk.MA_SO                     AS    "maSo",
                        qtsk.TEN_SANG_KIEN             AS    "tenSangKien",

                        (select dmcv.TEN
                         from QT_CHUC_VU qtcv
                                  LEFT JOIN DM_CHUC_VU dmcv on qtcv.MA_CHUC_VU = dmcv.MA
                         where cb.SHCC = qtcv.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as    "tenChucVu",

                        (select dmdv.TEN
                         from QT_CHUC_VU qtcv
                                  LEFT JOIN DM_DON_VI dmdv on qtcv.MA_DON_VI = dmdv.MA
                         where cb.SHCC = qtcv.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as    "tenDonVi",

                        (select dmbm.TEN
                         from QT_CHUC_VU qtcv
                                  LEFT JOIN DM_BO_MON dmbm on qtcv.MA_DON_VI = dmbm.MA
                         where cb.SHCC = qtcv.SHCC
                           and qtcv.CHUC_VU_CHINH = 1) as    "tenBoMon",

                        (select ngach.TEN
                         from TCHC_CAN_BO cb_temp
                                  LEFT JOIN DM_NGACH_CDNN ngach on cb_temp.NGACH = ngach.MA
                         where cb.SHCC = cb_temp.SHCC) as    "tenNgach",

                        cb.HO                          AS    "hoCanBo",
                        cb.TEN                         AS    "tenCanBo",

                        ROW_NUMBER() OVER (ORDER BY ID DESC) R
                 FROM QT_SANG_KIEN qtsk
                          LEFT JOIN TCHC_CAN_BO cb on qtsk.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL))
                     OR (list_shcc IS NOT NULL AND
                         ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, qtsk.SHCC) != 0) OR (list_shcc = qtsk.SHCC)))
                     OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(qtsk.MA_SO) LIKE sT
                     OR LOWER(qtsk.TEN_SANG_KIEN) LIKE sT)
                 ORDER BY cb.TEN
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
               dmqh.LOAI AS "loai",
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
             LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC;
    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT sgt.ID           AS                "id",
                        sgt.SHCC            AS                "shcc",
                        (SELECT COUNT(*)
                        FROM SACH_GIAO_TRINH sgt_temp
                                 LEFT JOIN TCHC_CAN_BO cb on sgt_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (sgt_temp.SHCC = sgt.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                                OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt_temp.NAM_SAN_XUAT >= fromYear))
                          AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt_temp.NAM_SAN_XUAT <= toYear))))
                            AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(sgt_temp.TEN) LIKE sT
                           OR LOWER(sgt_temp.SAN_PHAM) LIKE sT
                           OR LOWER(sgt_temp.NHA_SAN_XUAT) LIKE sT
                           OR LOWER(sgt_temp.BUT_DANH) LIKE sT)
                        ) AS "soLuong",

                        (select rtrim(xmlagg(xmlelement(e, sgt_temp.TEN || ' ','??').extract('//text()') order by null).getclobval(),'??')
                        FROM SACH_GIAO_TRINH sgt_temp
                                 LEFT JOIN TCHC_CAN_BO cb on sgt_temp.SHCC = cb.SHCC
                                 LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                        WHERE (sgt_temp.SHCC = sgt.SHCC)
                            AND (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                                OR (((list_shcc IS NOT NULL AND INSTR(list_shcc, sgt_temp.SHCC) != 0)
                          OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                          OR (list_shcc IS NULL AND list_dv IS NULL))
                          AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt_temp.NAM_SAN_XUAT >= fromYear))
                          AND (sgt_temp.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt_temp.NAM_SAN_XUAT <= toYear))))
                            AND (searchTerm = ''
                           OR LOWER(cb.SHCC) LIKE sT
                           OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                           OR LOWER(sgt_temp.TEN) LIKE sT
                           OR LOWER(sgt_temp.SAN_PHAM) LIKE sT
                           OR LOWER(sgt_temp.NHA_SAN_XUAT) LIKE sT
                           OR LOWER(sgt_temp.BUT_DANH) LIKE sT)
                        ) AS "danhSach",

                        cb.HO              AS                "hoCanBo",
                        cb.TEN             AS                "tenCanBo",

                        ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
                FROM (SELECT *
                      FROM SACH_GIAO_TRINH
                      WHERE ID IN (SELECT MAX(ID) FROM (SELECT * FROM SACH_GIAO_TRINH ORDER BY SHCC DESC) GROUP BY SHCC)) sgt
                         LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                ORDER BY sgt.NAM_SAN_XUAT DESC
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
    WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
        OR (((list_shcc IS NOT NULL AND
              ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, sgt.SHCC) != 0) OR (list_shcc = sgt.SHCC)))
            OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
            OR (list_shcc IS NULL AND list_dv IS NULL))
            AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT >= fromYear))
            AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt.NAM_SAN_XUAT <= toYear))))
      AND (searchTerm = ''
        OR LOWER(cb.SHCC) LIKE sT
        OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
        OR LOWER(sgt.TEN) LIKE sT
        OR LOWER(sgt.THE_LOAI) LIKE sT
        OR LOWER(sgt.SAN_PHAM) LIKE sT
        OR LOWER(sgt.CHU_BIEN) LIKE sT
        OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
        OR LOWER(sgt.BUT_DANH) LIKE sT);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN my_cursor FOR
        SELECT *
        FROM (
                 SELECT sgt.ID           AS                            "id",
                        sgt.TEN          AS                            "ten",
                        sgt.THE_LOAI     AS                            "theLoai",
                        sgt.NHA_SAN_XUAT AS                            "nhaSanXuat",
                        sgt.NAM_SAN_XUAT AS                            "namSanXuat",
                        sgt.SAN_PHAM     AS                            "sanPham",
                        sgt.CHU_BIEN     AS                            "chuBien",
                        sgt.BUT_DANH     AS                            "butDanh",
                        sgt.QUOC_TE      AS                            "quocTe",
                        sgt.SHCC         AS                            "shcc",

                        cb.HO            AS                            "hoCanBo",
                        cb.TEN           AS                            "tenCanBo",

                        dv.MA            AS                            "maDonVi",
                        dv.TEN           AS                            "tenDonVi",

                        ROW_NUMBER() OVER (ORDER BY NAM_SAN_XUAT DESC) R
                 FROM SACH_GIAO_TRINH sgt
                          LEFT JOIN TCHC_CAN_BO cb on sgt.SHCC = cb.SHCC
                          LEFT JOIN DM_DON_VI dv on (cb.MA_DON_VI = dv.MA)
                 WHERE (((list_shcc IS NULL) AND (list_dv IS NULL) AND (fromYear IS NULL) AND (toYear IS NULL))
                     OR (((list_shcc IS NOT NULL AND
                           ((INSTR(list_shcc, ',') != 0 AND INSTR(list_shcc, sgt.SHCC) != 0) OR (list_shcc = sgt.SHCC)))
                         OR (list_dv IS NOT NULL AND INSTR(list_dv, cb.MA_DON_VI) != 0)
                         OR (list_shcc IS NULL AND list_dv IS NULL))
                         AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (fromYear IS NULL OR sgt.NAM_SAN_XUAT >= fromYear))
                         AND (sgt.NAM_SAN_XUAT IS NOT NULL AND (toYear IS NULL OR sgt.NAM_SAN_XUAT <= toYear))))
                   AND (searchTerm = ''
                     OR LOWER(cb.SHCC) LIKE sT
                     OR LOWER(TRIM(cb.HO || ' ' || cb.TEN)) LIKE sT
                     OR LOWER(sgt.TEN) LIKE sT
                     OR LOWER(sgt.SAN_PHAM) LIKE sT
                     OR LOWER(sgt.THE_LOAI) LIKE sT
                     OR LOWER(sgt.CHU_BIEN) LIKE sT
                     OR LOWER(sgt.NHA_SAN_XUAT) LIKE sT
                     OR LOWER(sgt.BUT_DANH) LIKE sT)
                 ORDER BY sgt.NAM_SAN_XUAT DESC
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN my_cursor;

END;
/
--EndMethod--

CREATE OR REPLACE FUNCTION STUDENT_DASHBOARD_TOTAL_GENDER RETURN SYS_REFCURSOR
AS CUR SYS_REFCURSOR;
BEGIN
    OPEN CUR FOR
            SELECT
                   COUNT(CASE WHEN SV.MSSV IS NOT NULL THEN 1 END) AS "totalStaff",
                   COUNT(CASE WHEN SV.GIOI_TINH = 1 THEN 1 END) AS "totalMale",
                   COUNT(CASE WHEN SV.GIOI_TINH = 2 THEN 1 END) AS "totalFemale"
           FROM FW_STUDENT SV;

    RETURN CUR;
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

CREATE OR REPLACE FUNCTION TCCB_CAN_BO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, listDonVi IN STRING,
                                        gender IN STRING, listNgach IN STRING, listHocVi IN STRING,
                                        listChucDanh IN STRING, isBienChe IN NUMBER,
                                        searchTerm IN STRING,
                                        totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    canbosys SYS_REFCURSOR;
    ST       STRING(500) := '%' || lower(searchTerm) || '%';
BEGIN
    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
             LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
             LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
             LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

    WHERE ((listDonVi IS NULL AND gender IS NULL AND listNgach IS NULL AND listHocVi IS NULL AND
            listChucDanh IS NULL AND isBienChe IS NULL)
        OR (listDonVi IS NOT NULL AND INSTR(listDonVi, CB.MA_DON_VI) != 0)
        OR (gender IS NOT NULL AND CB.PHAI = gender)
        OR (listNgach IS NOT NULL AND INSTR(listNgach, CB.NGACH) != 0)
        OR (listHocVi IS NOT NULL AND INSTR(listHocVi, CB.HOC_VI) != 0)
        OR (listChucDanh IS NOT NULL AND INSTR(listChucDanh, CB.CHUC_DANH) != 0)
        OR (isBienChe IS NOT NULL
            AND (
                    (isBienChe = 1 AND CB.NGAY_BIEN_CHE IS NOT NULL) OR (isBienChe = 0 AND CB.NGAY_BIEN_CHE IS NULL)
                )
               )
        )
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE ST
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
        OR LOWER(CB.EMAIL) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN canbosys FOR
        SELECT *
        FROM (
                 SELECT CB.SHCC                   AS        "shcc",
                        CB.HO                     AS        "ho",
                        CB.TEN                    AS        "ten",
                        CB.PHAI                   AS        "phai",
                        CB.MA_DON_VI              AS        "maDonVi",
                        DV.TEN                    AS        "tenDonVi",
                        NG.TEN                    AS        "ngach",
                        TRINH_DO.TEN              AS        "hocVi",
                        CD.TEN                    AS        "hocHam",
                        (SELECT DMCV.TEN
                         FROM QT_CHUC_VU QTCV
                                  LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                         WHERE QTCV.SHCC = CB.SHCC
                           AND CHUC_VU_CHINH = 1) AS        "chucVuChinh",
                        CB.NGAY_SINH              AS        "ngaySinh",
                        CB.EMAIL                  AS        "email",
                        ROW_NUMBER() OVER (ORDER BY CB.TEN) R
                 FROM TCHC_CAN_BO CB
                          LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
                          LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                          LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
                          LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA

                 WHERE ((listDonVi IS NULL AND gender IS NULL AND listNgach IS NULL AND listHocVi IS NULL AND
                         listChucDanh IS NULL AND isBienChe IS NULL)
                     OR (listDonVi IS NOT NULL AND INSTR(listDonVi, CB.MA_DON_VI) != 0)
                     OR (gender IS NOT NULL AND CB.PHAI = gender)
                     OR (listNgach IS NOT NULL AND INSTR(listNgach, CB.NGACH) != 0)
                     OR (listHocVi IS NOT NULL AND INSTR(listHocVi, CB.HOC_VI) != 0)
                     OR (listChucDanh IS NOT NULL AND INSTR(listChucDanh, CB.CHUC_DANH) != 0)
                     OR (isBienChe IS NOT NULL AND (
                             (isBienChe = 1 AND CB.NGAY_BIEN_CHE IS NOT NULL) OR
                             (isBienChe = 0 AND CB.NGAY_BIEN_CHE IS NULL)
                         )))
                   AND (searchTerm = ''
                     OR LOWER(CB.SHCC) LIKE ST
                     OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                     OR LOWER(CB.EMAIL) LIKE ST)
                 ORDER BY CB.TEN
             )
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;
/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DASHBOARD_GET_NUMBER_STAFF_BY_DON_VI RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
BEGIN
    OPEN my_cursor FOR
        SELECT "numOfStaff","maDonVi",
               DV.MA_PL as "maPL",
                DV.TEN as "tenDonVi",
               DV.TEN_VIET_TAT as "tenVietTat"
        FROM (
            SELECT COUNT(CB.SHCC) as "numOfStaff",
                       CB.MA_DON_VI as "maDonVi"
                FROM TCHC_CAN_BO CB
            WHERE NGAY_NGHI IS NULL
                GROUP BY CB.MA_DON_VI

            ) LEFT JOIN DM_DON_VI DV
                ON "maDonVi"= DV.MA;
    RETURN my_cursor;
END ;
/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DASHBOARD_GET_STAFF_DANG_NUOC_NGOAI_BY_MUC_DICH RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT "numOfStaff",
               "mucDich",
               MD.MO_TA as "tenMucDich"
        FROM (
                 SELECT COUNT(DNN.SHCC) as "numOfStaff",
                        DNN.MUC_DICH    as "mucDich"
                 FROM QT_DI_NUOC_NGOAI DNN
                 WHERE NGAY_DI IS NOT NULL  AND NGAY_VE IS NOT NULL AND (NGAY_VE = -1
                    OR (NGAY_VE > today AND NGAY_DI < today))
                 GROUP BY DNN.MUC_DICH
             )
                 LEFT JOIN DM_MUC_DICH_NUOC_NGOAI MD
                           ON "mucDich" = MD.MA;
    RETURN my_cursor;
END ;
/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DASHBOARD_GET_STAFF_DANG_TRONG_NUOC_BY_MUC_DICH RETURN SYS_REFCURSOR
AS
    my_cursor SYS_REFCURSOR;
    today     NUMBER(20);
BEGIN
    select (cast(sysdate as date) - cast(to_date('1970-01-01', 'YYYY-MM-DD') as date)) * 86400000 into today from dual;
    OPEN my_cursor FOR
        SELECT "numOfStaff",
               "mucDich",
               MD.MO_TA as "tenMucDich"
        FROM (
                 SELECT COUNT(TN.SHCC) as "numOfStaff",
                        TN.VIET_TAT    as "mucDich"
                 FROM QT_CONG_TAC_TRONG_NUOC TN
                 WHERE BAT_DAU IS NOT NULL  AND KET_THUC IS NOT NULL AND (KET_THUC = -1
                    OR (KET_THUC > today AND BAT_DAU < today))
                 GROUP BY TN.VIET_TAT
             )
                 LEFT JOIN DM_MUC_DICH_TRONG_NUOC MD
                           ON "mucDich" = MD.MA;
    RETURN my_cursor;
END ;
/
--EndMethod--

CREATE OR REPLACE FUNCTION TCCB_DASHBOARD_TOTAL_GENDER RETURN SYS_REFCURSOR
AS CUR SYS_REFCURSOR;
BEGIN
    OPEN CUR FOR
            SELECT
                   COUNT(CASE WHEN CB.SHCC IS NOT NULL AND NGAY_NGHI IS NULL THEN 1 END) AS "totalStaff",
                   COUNT(CASE WHEN CB.PHAI = '01' AND NGAY_NGHI IS NULL THEN 1 END) AS "totalMale",
                   COUNT(CASE WHEN CB.PHAI = '02' AND NGAY_NGHI IS NULL THEN 1 END) AS "totalFemale",
                   COUNT(CASE WHEN CB.PHAI = '01' AND NGAY_NGHI IS NULL AND CB.HOC_VI = '02' THEN 1 END) AS "totalMalePhD",
                   COUNT(CASE WHEN CB.PHAI = '02' AND NGAY_NGHI IS NULL AND CB.HOC_VI = '02' THEN 1 END) AS "totalFemalePhD",
                   COUNT(CASE WHEN CB.PHAI = '01' AND NGAY_NGHI IS NULL AND CB.HOC_VI = '03' THEN 1 END) AS "totalMaleMaster",
                   COUNT(CASE WHEN CB.PHAI = '02' AND NGAY_NGHI IS NULL AND CB.HOC_VI = '03' THEN 1 END) AS "totalFemaleMaster",
                   COUNT(CASE WHEN CB.PHAI = '01' AND NGAY_NGHI IS NULL AND CB.HOC_VI = '04' THEN 1 END) AS "totalMaleBachelor",
                   COUNT(CASE WHEN CB.PHAI = '02'  AND CB.HOC_VI = '04' THEN 1 END) AS "totalFemaleBachelor"
           FROM TCHC_CAN_BO CB;

    RETURN CUR;
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

