CREATE OR REPLACE FUNCTION TCCB_CAN_BO_SEARCH_PAGE(pageNumber IN OUT NUMBER, pageSize IN OUT NUMBER, filter IN STRING,
                                        searchTerm IN STRING,
                                        totalItem OUT NUMBER, pageTotal OUT NUMBER) RETURN SYS_REFCURSOR
AS
    canbosys        SYS_REFCURSOR;
    ST              STRING(500) := '%' || lower(searchTerm) || '%';
    listShcc        STRING(100);
    listDonVi       STRING(100);
    listNgach       STRING(100);
    listHocVi       STRING(100);
    listChucDanh    STRING(100);
    gender          STRING(3);
    isBienChe       NUMBER;
    fromYear        NUMBER;
    toYear          NUMBER;
    listDanToc      STRING(100);
    listTonGiao     STRING(100);
    loaiHopDong     NUMBER;
    loaiChuyenVien  NUMBER;
    listQuocGia     STRING(100);
    fromAge         NUMBER;
    toAge           NUMBER;
    time            NUMBER;
    listChuyenNganh STRING(100);
BEGIN
    SELECT JSON_VALUE(filter, '$.listShcc') INTO listShcc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDonVi') INTO listDonVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.gender') INTO gender FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listNgach') INTO listNgach FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listHocVi') INTO listHocVi FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChucDanh') INTO listChucDanh FROM DUAL;
    SELECT JSON_VALUE(filter, '$.isBienChe') INTO isBienChe FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromYear') INTO fromYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toYear') INTO toYear FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listDanToc') INTO listDanToc FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listTonGiao') INTO listTonGiao FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiHopDong') INTO loaiHopDong FROM DUAL;
    SELECT JSON_VALUE(filter, '$.loaiChuyenVien') INTO loaiChuyenVien FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listQuocGia') INTO listQuocGia FROM DUAL;
    SELECT JSON_VALUE(filter, '$.fromAge') INTO fromAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.toAge') INTO toAge FROM DUAL;
    SELECT JSON_VALUE(filter, '$.listChuyenNganh') INTO listChuyenNganh FROM DUAL;

    SELECT COUNT(*)
    INTO totalItem
    FROM TCHC_CAN_BO CB
             LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
             LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
             LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
             LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
             LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
             LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.DAN_TOC = dmTonGiao.MA

    WHERE (
            ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                   from dual
                                                   connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                OR (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                OR (listShcc IS NULL AND listDonVi IS NULL))
            AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
            AND (listNgach IS NULL OR
                 listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                        from dual
                                                        connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
            AND (listHocVi IS NULL OR
                 listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
            AND (listChucDanh IS NULL OR
                 listChucDanh IS NOT NULL AND CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                                               from dual
                                                               connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
            AND (isBienChe IS NULL OR
                 (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                 (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                )
            AND (fromYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
            AND (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
            AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level)
                                                       from dual
                                                       connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
            AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level)
                                                         from dual
                                                         connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
            AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                                         EXISTS(
                                                 SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                                 INTERSECT
                                                 SELECT regexp_substr(listQuocGia, '[^,]+', 1, level)
                                                 from dual
                                                 connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                             )
            ))
            AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
            AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
            AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                               (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                from dual)) / 12)
                                                                   from dual) >= fromAge))
            AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                             (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                              from dual)) / 12)
                                                                 from dual) <= toAge))
            AND
            (listChuyenNganh IS NULL OR (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
        )
      AND (NGAY_NGHI IS NULL OR NGAY_NGHI < time)
      AND (searchTerm = ''
        OR LOWER(CB.SHCC) LIKE ST
        OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
        OR LOWER(CB.EMAIL) LIKE ST
        OR LOWER(CB.CHUYEN_NGANH) LIKE ST
        OR LOWER(CB.DANH_HIEU) LIKE ST
        OR LOWER(CB.GHI_CHU) LIKE ST);

    IF pageNumber < 1 THEN pageNumber := 1; END IF;
    IF pageSize < 1 THEN pageSize := 1; END IF;
    pageTotal := CEIL(totalItem / pageSize);
    pageNumber := LEAST(pageNumber, pageTotal);

    OPEN canbosys FOR
        SELECT *
        FROM (SELECT CB.SHCC                                                    AS "shcc",
                     CB.HO                                                      AS "ho",
                     CB.TEN                                                     AS "ten",
                     CB.PHAI                                                    AS "phai",
                     CB.MA_DON_VI                                               AS "maDonVi",
                     DV.TEN                                                     AS "tenDonVi",
                     NG.MA                                                      AS "ngach",
                     NG.TEN                                                     AS "tenChucDanhNgheNghiep",
                     TRINH_DO.TEN                                               AS "hocVi",
                     CB.NAM_HOC_VI                                              AS "namHocVi",
                     CD.TEN                                                     AS "hocHam",
                     CB.NAM_CHUC_DANH                                           AS "namChucDanh",
                     CB.CHUYEN_NGANH_CHUC_DANH                                  AS "chuyenNganhChucDanh",
                     CB.NGAY_BAT_DAU_CONG_TAC                                   AS "ngayBatDauCongTac",
                     CB.NGAY_BIEN_CHE                                           AS "ngayBienChe",
                     CB.THAC_SI                                                 AS "thacSi",
                     CB.TIEN_SI                                                 AS "tienSi",
                     CB.CHUYEN_NGANH                                            AS "chuyenNganh",
                     CB.QUE_QUAN                                                AS "queQuan",
                     CB.IS_CVDT                                                 AS "isCvdt",
                     CB.IS_HDTN                                                 AS "isHdtn",
                     CB.HOC_VI_NOI_TOT_NGHIEP                                   AS "hocViNoiTotNghiep",
                     CB.TRINH_DO_PHO_THONG                                      AS "trinhDoPhoThong",
                     CB.HE_SO_LUONG                                             AS "heSoLuong",
                     CB.BAC_LUONG                                               AS "bacLuong",
                     CB.MOC_NANG_LUONG                                          AS "mocNangLuong",
                     CB.TY_LE_VUOT_KHUNG                                        AS "tyLeVuotKhung",
                     CB.CMND                                                    AS "cmnd",
                     CB.CMND_NGAY_CAP                                           AS "cmndNgayCap",
                     CB.CMND_NOI_CAP                                            AS "cmndNoiCap",
                     CB.DANH_HIEU                                               AS "danhHieu",
                     CB.DANG_VIEN                                               AS "dangVien",
                     CB.GHI_CHU                                                 AS "ghiChuStaff",
                     CB.LAST_MODIFIED                                           as "lastModified",
                     (SELECT DMCV.TEN
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "chucVuChinh",

                     (SELECT QTCV.MA_CHUC_VU
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "maChucVuChinh",

                     (SELECT QTCV.NGAY_RA_QD
                      FROM QT_CHUC_VU QTCV
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "boNhiemNgay",

                     (SELECT DMCV.PHU_CAP
                      FROM QT_CHUC_VU QTCV
                               LEFT JOIN DM_CHUC_VU DMCV ON DMCV.MA = QTCV.MA_CHUC_VU
                      WHERE QTCV.SHCC = CB.SHCC
                        AND CHUC_VU_CHINH = 1)                                  AS "phuCapChucVu",
                     (CASE
                          WHEN CB.NGAY_BIEN_CHE IS NULL THEN 'Hợp đồng'
                          ELSE 'Biên chế'
                         END)                                                   AS "loaiCanBo",
                     (select rtrim(xmlagg(xmlelement(e, dmqg.TEN_QUOC_GIA, '-').extract('//text()') order by
                                          null).getclobval(), '-')
                      FROM DM_QUOC_GIA dmqg
                      WHERE INSTR(CB.HOC_VI_NOI_TOT_NGHIEP, dmqg.MA_CODE) != 0) AS "danhSahcQuocGiaHocViNoiTotNghiep",
--                         (CASE
--                              WHEN CB.TIEN_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                   FROM QT_DAO_TAO qtdt
--                                   WHERE qtdt.SHCC = CB.SHCC
--                                     AND qtdt.TRINH_DO = '4' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatTienSi",
--                         (CASE WHEN CB.THAC_SI = 1 THEN
--                                  (SELECT qtdt.KET_THUC
--                                    FROM QT_DAO_TAO qtdt
--                                    WHERE qtdt.SHCC = CB.SHCC AND qtdt.TRINH_DO = '3' AND ROWNUM <= 1)
--                             END)                  AS "ngayCapNhatThacSi",

                     CB.NGAY_SINH                                               AS "ngaySinh",
                     CB.EMAIL                                                   AS "email",

                     dmDanToc.MA                                                AS "maDanToc",
                     dmDanToc.TEN                                               AS "tenDanToc",

                     dmTonGiao.MA                                               AS "maTonGiao",
                     dmTonGiao.TEN                                              AS "tenTonGiao",

                     ROW_NUMBER() OVER (ORDER BY CB.TEN)                           R
              FROM TCHC_CAN_BO CB
                       LEFT JOIN DM_DON_VI DV on CB.MA_DON_VI = DV.MA
                       LEFT JOIN DM_TRINH_DO TRINH_DO ON TRINH_DO.MA = CB.HOC_VI
                       LEFT JOIN DM_NGACH_CDNN NG on CB.NGACH = NG.MA
                       LEFT JOIN DM_CHUC_DANH_KHOA_HOC CD ON CB.CHUC_DANH = CD.MA
                       LEFT JOIN DM_DAN_TOC dmDanToc ON CB.DAN_TOC = dmDanToc.MA
                       LEFT JOIN DM_TON_GIAO dmTonGiao ON CB.TON_GIAO = dmTonGiao.MA

              WHERE (
                      ((listShcc IS NOT NULL AND cb.SHCC IN (SELECT regexp_substr(listShcc, '[^,]+', 1, level)
                                                             from dual
                                                             connect by regexp_substr(listShcc, '[^,]+', 1, level) is not null))
                          OR
                       (listDonVi IS NOT NULL AND cb.MA_DON_VI IN (SELECT regexp_substr(listDonVi, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listDonVi, '[^,]+', 1, level) is not null))
                          OR (listShcc IS NULL AND listDonVi IS NULL))
                      AND (gender IS NULL OR gender IS NOT NULL AND CB.PHAI = gender)
                      AND (listNgach IS NULL OR
                           listNgach IS NOT NULL AND CB.NGACH IN (SELECT regexp_substr(listNgach, '[^,]+', 1, level)
                                                                  from dual
                                                                  connect by regexp_substr(listNgach, '[^,]+', 1, level) is not null))
                      AND (listHocVi IS NULL OR
                           listHocVi IS NOT NULL AND CB.HOC_VI IN (SELECT regexp_substr(listHocVi, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listHocVi, '[^,]+', 1, level) is not null))
                      AND (listChucDanh IS NULL OR
                           listChucDanh IS NOT NULL AND
                           CB.CHUC_DANH IN (SELECT regexp_substr(listChucDanh, '[^,]+', 1, level)
                                            from dual
                                            connect by regexp_substr(listChucDanh, '[^,]+', 1, level) is not null))
                      AND (isBienChe IS NULL OR
                           (isBienChe = 0 AND NGAY_BIEN_CHE IS NOT NULL) OR
                           (isBienChe = 1 AND NGAY_BIEN_CHE IS NULL)
                          )
                      AND (fromYear IS NULL OR
                           (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC >= fromYear))
                      AND
                      (toYear IS NULL OR (CB.NGAY_BAT_DAU_CONG_TAC IS NOT NULL AND CB.NGAY_BAT_DAU_CONG_TAC <= toYear))
                      AND (listDanToc IS NULL OR (CB.DAN_TOC IN (SELECT regexp_substr(listDanToc, '[^,]+', 1, level)
                                                                 from dual
                                                                 connect by regexp_substr(listDanToc, '[^,]+', 1, level) is not null)))
                      AND (listTonGiao IS NULL OR (CB.TON_GIAO IN (SELECT regexp_substr(listTonGiao, '[^,]+', 1, level)
                                                                   from dual
                                                                   connect by regexp_substr(listTonGiao, '[^,]+', 1, level) is not null)))
                      AND (listQuocGia IS NULL OR (CB.HOC_VI_NOI_TOT_NGHIEP IS NOT NULL AND
                                                   EXISTS(
                                                           SELECT regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(TO_CHAR(CB.HOC_VI_NOI_TOT_NGHIEP), '[^,]+', 1, level) is not null
                                                           INTERSECT
                                                           SELECT regexp_substr(listQuocGia, '[^,]+', 1, level)
                                                           from dual
                                                           connect by regexp_substr(listQuocGia, '[^,]+', 1, level) is not null
                                                       )
                      ))
                      AND (loaiHopDong IS NULL OR CB.IS_HDTN = loaiHopDong)
                      AND (loaiChuyenVien IS NULL OR CB.IS_CVDT = loaiChuyenVien)
                      AND (fromAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                                         (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                          from dual)) /
                                                                                          12)
                                                                             from dual) >= fromAge))
                      AND (toAge IS NULL OR (cb.NGAY_SINH IS NOT NULL AND (SELECT TRUNC(MONTHS_BETWEEN(TRUNC(sysdate),
                                                                                                       (select to_date('19700101', 'YYYYMMDD') + (1 / 24 / 60 / 60 / 1000) * cb.NGAY_SINH
                                                                                                        from dual)) /
                                                                                        12)
                                                                           from dual) <= toAge))
                      AND (listChuyenNganh IS NULL OR
                           (CB.CHUYEN_NGANH IN (SELECT regexp_substr(listChuyenNganh, '[^,]+', 1, level)
                                                from dual
                                                connect by regexp_substr(listChuyenNganh, '[^,]+', 1, level) is not null)))
                  )
                AND (NGAY_NGHI IS NULL OR NGAY_NGHI < time)
                AND (searchTerm = ''
                  OR LOWER(CB.SHCC) LIKE ST
                  OR LOWER(TRIM(CB.HO || ' ' || CB.TEN)) LIKE ST
                  OR LOWER(CB.EMAIL) LIKE ST
                  OR LOWER(CB.CHUYEN_NGANH) LIKE ST
                  OR LOWER(CB.DANH_HIEU) LIKE ST
                  OR LOWER(CB.GHI_CHU) LIKE ST)
              ORDER BY CB.TEN)
        WHERE R BETWEEN (pageNumber - 1) * pageSize + 1 AND pageNumber * pageSize;
    RETURN canbosys;
end;

/
--EndMethod--

CREATE OR REPLACE FUNCTION TCHC_CAN_BO_GET_DATA_ALL(mtcb IN STRING, QT_CHUC_VU OUT SYS_REFCURSOR, QT_DAO_TAO OUT SYS_REFCURSOR,
                                         QT_HOC_TAP_CONG_TAC OUT SYS_REFCURSOR,
                                         TO_CHUC_KHAC OUT SYS_REFCURSOR,
                                         QUAN_HE_GIA_DINH OUT SYS_REFCURSOR) RETURN SYS_REFCURSOR
AS
    CAN_BO SYS_REFCURSOR;
BEGIN

    OPEN CAN_BO FOR
        SELECT STAFF.SHCC                                             AS "shcc",
               STAFF.HO                                               AS "ho",
               STAFF.TEN                                              AS "ten",
               STAFF.BI_DANH                                          AS "otherName",
               staff.NGAY_SINH                                        as "ngaySinh",
               (CASE WHEN staff.PHAI = '02' THEN 'Nữ' ELSE 'Nam' end) as "gioiTinh",

               xaNoiSinh.TEN_PHUONG_XA                                as "xaNoiSinh",
               huyenNoiSinh.TEN_QUAN_HUYEN                            as "huyenNoiSinh",
               tinhNoiSinh.TEN                                        AS "tinhNoiSinh",

               xaNguyenQuan.TEN_PHUONG_XA                             AS "xaNguyenQuan",
               huyenNguyenQuan.TEN_QUAN_HUYEN                         AS "huyenNguyenQuan",
               tinhNguyenQuan.TEN                                     AS "tinhNguyenQuan",

               danToc.TEN                                             as "danToc",
               tonGiao.TEN                                            as "tonGiao",
               xaThuongTru.TEN_PHUONG_XA                              as "xaThuongTru",
               huyenThuongTru.TEN_QUAN_HUYEN                          as "huyenThuongTru",
               tinhThuongTru.ten                                      as "tinhThuongTru",
               staff.THUONG_TRU_SO_NHA                                as "soNhaThuongTru",

               xaHienTai.TEN_PHUONG_XA                                as "xaHienTai",
               huyenHienTai.TEN_QUAN_HUYEN                            as "huyenHienTai",
               tinhHienTai.ten                                        as "tinhHienTai",
               staff.HIEN_TAI_SO_NHA                                  as "soNhaHienTai",

               staff.NGHE_NGHIEP_CU                                   as "ngheTuyen",
               staff.NGAY_BAT_DAU_CONG_TAC                            as "ngayTuyen",
               staff.DON_VI_TUYEN_DUNG                                as "coQuanTuyen",
               staff.NGACH                                            as "maNgach",
               ngach.TEN                                              as "tenNgach",
               staff.NGAY_HUONG_LUONG                                 as "ngayHuongLuong",
               staff.BAC_LUONG                                        as "bacLuong",
               staff.HE_SO_LUONG                                      as "heSoLuong",
               staff.TRINH_DO_PHO_THONG                               as "phoThong",
               hocVi.TEN                                              as "hocVi",
               staff.NGAY_VAO_DANG                                    as "ngayVaoDang",
               staff.NGAY_VAO_DANG_CHINH_THUC                         as "ngayVaoDangChinhThuc",
               staff.NGAY_NHAP_NGU                                    as "ngayNhapNgu",
               staff.NGAY_XUAT_NGU                                    as "ngayXuatNgu",
               staff.QUAN_HAM_CAO_NHAT                                as "quanHam",
               staff.SO_TRUONG                                        as "soTruong",
               staff.SUC_KHOE                                         as "sucKhoe",
               staff.CHIEU_CAO                                        as "chieuCao",
               staff.CAN_NANG                                         as "canNang",
               nhomMau.TEN                                            as "nhomMau",
               staff.HANG_THUONG_BINH                                 as "hangThuongBinh",
               staff.GIA_DINH_CHINH_SACH                              as "giaDinhChinhSach",
               staff.CMND                                             as "cmnd",
               staff.CMND_NGAY_CAP                                    as "ngayCapCmnd",
               staff.CMND_NOI_CAP                                     as "noiCapCmnd",
               staff.SO_BHXH                                          as "soBaoHiemXaHoi",
               chucDanh.TEN                                           AS "chucDanh",
               staff.NAM_CHUC_DANH                                    AS "namChucDanh",

               (select rtrim(xmlagg(xmlelement(e, daoTao.CHUYEN_NGANH, ' - ', daoTao.TRINH_DO, ', ').extract('//text()')
                                    order by
                                    null).getclobval(), ', ')
                FROM QT_DAO_TAO daoTao
                         LEFT JOIN DM_BANG_DAO_TAO bdt on daoTao.LOAI_BANG_CAP = bdt.MA
                WHERE daoTao.SHCC = mtcb
                  AND daoTao.LOAI_BANG_CAP = 5)                       AS "ngoaiNgu"
        FROM TCHC_CAN_BO STAFF
                 LEFT JOIN DM_PHUONG_XA xaNoiSinh
                           ON STAFF.MA_XA_NOI_SINH = xaNoiSinh.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNoiSinh ON huyenNoiSinh.MA_QUAN_HUYEN = STAFF.MA_HUYEN_NOI_SINH
                 LEFT JOIN DM_TINH_THANH_PHO tinhNoiSinh ON STAFF.MA_TINH_NOI_SINH = tinhNoiSinh.MA
                 LEFT JOIN DM_PHUONG_XA xaNguyenQuan ON STAFF.MA_XA_NGUYEN_QUAN = xaNguyenQuan.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenNguyenQuan ON STAFF.MA_HUYEN_NGUYEN_QUAN = huyenNguyenQuan.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhNguyenQuan ON STAFF.MA_TINH_NGUYEN_QUAN = tinhNguyenQuan.MA
                 LEFT JOIN DM_DAN_TOC danToc ON STAFF.DAN_TOC = danToc.MA
                 LEFT JOIN DM_TON_GIAO tonGiao ON STAFF.TON_GIAO = tonGiao.MA
                 LEFT JOIN DM_PHUONG_XA xaThuongTru ON STAFF.THUONG_TRU_MA_XA = xaThuongTru.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenThuongTru ON STAFF.THUONG_TRU_MA_HUYEN = huyenThuongTru.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhThuongTru ON STAFF.THUONG_TRU_MA_TINH = tinhThuongTru.MA
                 LEFT JOIN DM_PHUONG_XA xaHienTai ON STAFF.HIEN_TAI_MA_XA = xaHienTai.MA_PHUONG_XA
                 LEFT JOIN DM_QUAN_HUYEN huyenHienTai ON STAFF.HIEN_TAI_MA_HUYEN = huyenHienTai.MA_QUAN_HUYEN
                 LEFT JOIN DM_TINH_THANH_PHO tinhHienTai ON STAFF.HIEN_TAI_MA_TINH = tinhHienTai.MA
                 LEFT JOIN DM_NGACH_CDNN ngach ON ngach.MA = staff.NGACH
                 left join DM_TRINH_DO hocVi ON hocVi.MA = staff.HOC_VI
                 LEFT JOIN DM_NHOM_MAU nhomMau ON nhomMau.MA = staff.NHOM_MAU
                 LEFT JOIN DM_CHUC_DANH_KHOA_HOC chucDanh ON chucDanh.MA = staff.CHUC_DANH

        WHERE STAFF.SHCC = mtcb;

    OPEN QT_CHUC_VU FOR
        SELECT DM_DON_VI.TEN      AS "donVi",
               DM_CHUC_VU.TEN     AS "chucVu",
               DM_CHUC_VU.PHU_CAP as "phuCapChucVu",
               cv.CHUC_VU_CHINH   AS "chucVuChinh"
        FROM QT_CHUC_VU cv
                 LEFT JOIN DM_CHUC_VU ON DM_CHUC_VU.MA = CV.MA_CHUC_VU
                 LEFT JOIN DM_DON_VI ON DM_DON_VI.MA = CV.MA_DON_VI
                 LEFT JOIN DM_BO_MON ON DM_BO_MON.MA = CV.MA_BO_MON
        WHERE cv.SHCC = mtcb
          and cv.THOI_CHUC_VU = 0;

    OPEN QUAN_HE_GIA_DINH FOR
        SELECT quanhe.HO_TEN       AS "hoTen",
               quanhe.NAM_SINH     AS "namSinh",
               quanhe.NGHE_NGHIEP  AS "ngheNghiep",
               quanhe.NOI_CONG_TAC AS "noiCongTac",
               qh.TEN              AS "moiQuanHe",
               qh.LOAI             AS "loai"
        FROM QUAN_HE_CAN_BO quanhe
                 LEFT JOIN DM_QUAN_HE_GIA_DINH qh ON quanhe.MOI_QUAN_HE = qh.MA
        WHERE quanhe.SHCC = mtcb;

    OPEN QT_HOC_TAP_CONG_TAC FOR
        SELECT HTCT.BAT_DAU       as "batDau",
               HTCT.KET_THUC_TYPE as "ketThucType",
               HTCT.KET_THUC      as "ketThuc",
               htct.BAT_DAU_TYPE  as "batDauType",
               HTCT.NOI_DUNG      as "noiDung"
        FROM QT_HOC_TAP_CONG_TAC HTCT
        where htct.SHCC = mtcb;

    open TO_CHUC_KHAC FOR
        SELECT tck.NGAY_THAM_GIA as "ngayThamGia",
               tck.TEN_TO_CHUC   as "tenToChuc",
               tck.MO_TA         as "moTa"
        FROM TCCB_TO_CHUC_KHAC TCK
        where tck.SHCC = mtcb;

    open QT_DAO_TAO for
        select qtdt.TEN_TRUONG    as "coSo",
               qtdt.CHUYEN_NGANH  as "chuyenNganh",
               qtdt.BAT_DAU       as "batDau",
               qtdt.BAT_DAU_TYPE  as "batDauType",
               qtdt.KET_THUC      as "ketThuc",
               qtdt.KET_THUC_TYPE as "ketThucType",
               qtdt.HINH_THUC     as "hinhThuc",
               qtdt.LOAI_BANG_CAP as "loaiBangCap",
               qtdt.TRINH_DO      as "trinhDo",
               bdt.TEN            as "tenLoaiBangCap",
               htdt.TEN           as "tenHinhThuc",
               TDDT.TEN           AS "tenTrinhDo"
        from QT_DAO_TAO qtdt
                 LEFT JOIN DM_BANG_DAO_TAO bdt on qtdt.LOAI_BANG_CAP = bdt.MA
                 LEFT JOIN DM_HINH_THUC_DAO_TAO htdt on qtdt.HINH_THUC = htdt.MA
                 LEFT JOIN DM_TRINH_DO_DAO_TAO TDDT ON TDDT.MA = qtdt.TRINH_DO
        where qtdt.SHCC = mtcb
          AND qtdt.KET_THUC != -1;

    return CAN_BO;
END;

/
--EndMethod--

